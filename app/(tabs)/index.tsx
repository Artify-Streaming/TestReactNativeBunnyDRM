import { useEvent } from 'expo';
import { useVideoPlayer, VideoView, VideoSource, DRMOptions } from 'expo-video';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Button, Text } from 'react-native';
import axios from 'axios';
import { Buffer } from 'buffer';

const video_link = 'https://vz-2079b88a-359.b-cdn.net/a614055c-1645-4193-88bd-5626aa99757b/playlist.m3u8';
// const video_link = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
const drm: DRMOptions = {
	type: 'fairplay',
	licenseServer: 'https://video.bunnycdn.com/FairPlay/201080/license?videoId=a614055c-1645-4193-88bd-5626aa99757b',
	headers: {
		'Content-type': 'application/json'
	},
	contentId: 'a614055c-1645-4193-88bd-5626aa99757b',
	certificateUrl: 'https://video.bunnycdn.com/FairPlay/201080/certificate',
	base64CertificateData: '',
}




async function loadFpCertificate() {  
	try {
		console.log('Loading Certificate:', drm.certificateUrl);
		const response = await axios.get(drm.certificateUrl!);
		const data = Buffer.from(response.data).toString('base64');
		console.log('Certificate loaded (base64):', data); 
		return data;
	} catch (e) {  
		console.error(`Could not load certificate at ${drm.certificateUrl}`, e); 
	}  
}



export default function VideoScreen() {

	const [videoSource, setVideoSource] = useState<VideoSource>();

	useEffect(() => {
		(async () => {
			if (drm.certificateUrl) {
				drm.base64CertificateData = await loadFpCertificate();
				setVideoSource({
					uri: video_link,
					drm
				})
			}
		})();
	}, []);

	if (!videoSource) {
		return (
			<View style={styles.contentContainer}>
				<Text style={{ color: 'yellow' }}>Loading...</Text>
			</View>
		);
	}
	return (
		<Player sourceConfig={videoSource} />
	);

}

function Player({ sourceConfig }: { sourceConfig: VideoSource }) {	

  const player = useVideoPlayer(sourceConfig, player => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status, error } = useEvent(player, 'statusChange', { status: player.status });

  if (error) {
	console.error('Player Status:', status, error.message, error);
	return (
		<View style={styles.contentContainer}>
			<Text style={{ color: 'red' }}>Player Status: {status} {error.message}</Text>
		</View>
	)
}	

  return (
    <View style={styles.contentContainer}>
      <VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture />
      <View style={styles.controlsContainer}>
        <Button
          title={isPlaying ? 'Pause' : 'Play'}
          onPress={() => {
            if (isPlaying) {
              player.pause();
            } else {
              player.play();
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  video: {
    width: 350,
    height: 275,
  },
  controlsContainer: {
    padding: 10,
  },
});