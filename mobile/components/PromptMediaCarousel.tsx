import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Haptics from 'expo-haptics';
import { Config } from '../constants/Config';
import { Theme } from '../constants/Theme';
import { resolveMediaUrl } from '../utils/url';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PromptVideoSlideProps {
  videoUrl: string;
  posterUrl?: string;
  isActive: boolean;
  onDownload: () => void;
  isDownloading: boolean;
}

const PromptVideoSlide: React.FC<PromptVideoSlideProps> = ({
  videoUrl,
  posterUrl,
  isActive,
  onDownload,
  isDownloading,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    if (!player) return;
    try {
      if (isActive) {
        player.play();
        setIsPlaying(true);
      } else {
        player.pause();
        setIsPlaying(false);
      }
    } catch {}
  }, [isActive, player]);

  useEffect(() => {
    if (!player) return;
    const statusSub = player.addListener('statusChange', (payload) => {
      if (payload.status === 'readyToPlay') {
        setIsBuffering(false);
      } else if (payload.status === 'loading') {
        setIsBuffering(true);
      } else if (payload.status === 'error') {
        setIsBuffering(false);
      }
    });
    return () => statusSub?.remove?.();
  }, [player]);

  const togglePlay = () => {
    if (!player) return;
    Haptics.selectionAsync().catch(() => {});
    try {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    } catch {}
  };

  const toggleMute = () => {
    if (!player) return;
    Haptics.selectionAsync().catch(() => {});
    try {
      const next = !isMuted;
      player.muted = next;
      setIsMuted(next);
    } catch {}
  };

  return (
    <View style={styles.slideItem}>
      {posterUrl ? (
        <Image
          source={{ uri: posterUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          blurRadius={4}
        />
      ) : null}

      <TouchableOpacity
        activeOpacity={1}
        onPress={togglePlay}
        style={StyleSheet.absoluteFill}
      >
        <VideoView
          player={player}
          style={styles.videoView}
          nativeControls={false}
          contentFit="cover"
        />

        {isBuffering && (
          <View style={styles.bufferOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        {!isPlaying && !isBuffering && (
          <View style={styles.centerPlayWrap} pointerEvents="none">
            <View style={styles.centerPlayCircle}>
              <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Bottom Video Controls & Download Button */}
      <View style={styles.videoControlsRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleMute}
          style={styles.videoControlCircle}
        >
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            size={17}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onDownload}
          disabled={isDownloading}
          style={styles.videoDownloadOverlayBtn}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="download-outline" size={15} color="#FFFFFF" />
          )}
          <Text style={styles.videoDownloadOverlayText}>
            {isDownloading ? 'Downloading...' : 'Download Video'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

interface PromptMediaCarouselProps {
  promptId: number;
  coverImage: string;
  galleryImages?: string[];
  videoUrl?: string | null;
}

export const PromptMediaCarousel: React.FC<PromptMediaCarouselProps> = ({
  promptId,
  coverImage,
  galleryImages = [],
  videoUrl,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const photos = React.useMemo(() => {
    const raw = [coverImage, ...(Array.isArray(galleryImages) ? galleryImages : [])].filter(
      (u): u is string => Boolean(u && u.trim())
    );
    return Array.from(new Set(raw.map((u) => resolveMediaUrl(u))));
  }, [coverImage, galleryImages]);

  const resolvedVideoUrl = React.useMemo(() => {
    if (!videoUrl || !videoUrl.trim()) return null;
    return resolveMediaUrl(videoUrl.trim());
  }, [videoUrl]);

  const totalSlides = photos.length + (resolvedVideoUrl ? 1 : 0);
  const videoSlideIndex = resolvedVideoUrl ? photos.length : -1;

  const scrollToSlide = (index: number) => {
    if (index < 0 || index >= totalSlides) return;
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  };

  const handleDownloadVideo = async () => {
    if (!resolvedVideoUrl) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setIsDownloading(true);
    try {
      const downloadEndpoint = `${Config.API_URL}/prompts/${promptId}/download-video`;
      const canOpen = await Linking.canOpenURL(downloadEndpoint).catch(() => false);
      if (canOpen) {
        await Linking.openURL(downloadEndpoint);
      } else {
        await Linking.openURL(resolvedVideoUrl);
      }
    } catch {
      Linking.openURL(resolvedVideoUrl).catch(() => {
        Alert.alert('Download Error', 'Unable to open video download link.');
      });
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  return (
    <View>
      <View style={styles.carouselWrapper}>
        {totalSlides > 1 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              if (idx >= 0 && idx < totalSlides) {
                setActiveIndex(idx);
              }
            }}
            style={StyleSheet.absoluteFill}
          >
            {photos.map((uri, idx) => (
              <View key={`photo-${idx}`} style={styles.slideItem}>
                <Image source={{ uri }} style={styles.coverImage} resizeMode="cover" />
              </View>
            ))}

            {resolvedVideoUrl && (
              <PromptVideoSlide
                videoUrl={resolvedVideoUrl}
                posterUrl={photos[0]}
                isActive={activeIndex === videoSlideIndex}
                onDownload={handleDownloadVideo}
                isDownloading={isDownloading}
              />
            )}
          </ScrollView>
        ) : (
          <Image
            source={{ uri: photos[0] || coverImage }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        )}

        {/* Bottom Overlay Bar: Slide Counter, Pagination Dots & Media Switcher */}
        {totalSlides > 1 && (
          <View style={styles.bottomBarOverlay} pointerEvents="box-none">
            {/* Slide Counter Badge */}
            <View style={styles.counterBadge} pointerEvents="none">
              <Ionicons
                name={activeIndex === videoSlideIndex ? 'videocam' : 'images'}
                size={11}
                color="#FFFFFF"
              />
              <Text style={styles.counterText}>
                {activeIndex + 1} / {totalSlides}
              </Text>
            </View>

            {/* Pagination Dots */}
            <View style={styles.dotsContainer} pointerEvents="none">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === activeIndex && styles.dotActive,
                    idx === videoSlideIndex && idx !== activeIndex && styles.dotVideo,
                  ]}
                />
              ))}
            </View>

            {/* Quick Video Jump Pill */}
            {resolvedVideoUrl ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() =>
                  scrollToSlide(activeIndex === videoSlideIndex ? 0 : videoSlideIndex)
                }
                style={styles.switchMediaBtn}
              >
                <Ionicons
                  name={activeIndex === videoSlideIndex ? 'images-outline' : 'play-circle'}
                  size={13}
                  color="#FFFFFF"
                />
                <Text style={styles.switchMediaText}>
                  {activeIndex === videoSlideIndex ? 'Photos' : 'Watch Video'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 48 }} />
            )}
          </View>
        )}
      </View>

      {/* Thumbnail Strip + Downloadable Video Action Bar below Carousel */}
      {(photos.length > 1 || resolvedVideoUrl) && (
        <View style={styles.mediaStripBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbScroll}
          >
            {photos.map((uri, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <TouchableOpacity
                  key={`thumb-${idx}`}
                  activeOpacity={0.8}
                  onPress={() => scrollToSlide(idx)}
                  style={[styles.thumbItem, isSelected && styles.thumbItemActive]}
                >
                  <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
                </TouchableOpacity>
              );
            })}

            {resolvedVideoUrl && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => scrollToSlide(videoSlideIndex)}
                style={[
                  styles.thumbItem,
                  styles.thumbVideoItem,
                  activeIndex === videoSlideIndex && styles.thumbItemActive,
                ]}
              >
                {photos[0] ? (
                  <Image
                    source={{ uri: photos[0] }}
                    style={[styles.thumbImage, { opacity: 0.55 }]}
                    resizeMode="cover"
                  />
                ) : null}
                <View style={styles.thumbVideoIconOverlay}>
                  <Ionicons name="play" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>

          {resolvedVideoUrl && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleDownloadVideo}
              disabled={isDownloading}
              style={styles.downloadVideoBtn}
            >
              <LinearGradient
                colors={['#E11D48', '#FF7A00']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.downloadVideoGradient}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="download-outline" size={14} color="#FFFFFF" />
                )}
                <Text style={styles.downloadVideoText}>Download Video</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  carouselWrapper: {
    width: '100%',
    aspectRatio: 4 / 5,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  slideItem: {
    width: SCREEN_WIDTH,
    height: '100%',
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  bufferOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  centerPlayWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlayCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  videoControlsRow: {
    position: 'absolute',
    bottom: 46,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 12,
  },
  videoControlCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  videoDownloadOverlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(225, 29, 72, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  videoDownloadOverlayText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  bottomBarOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  counterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 16,
    backgroundColor: '#FFFFFF',
  },
  dotVideo: {
    backgroundColor: '#FB7185',
  },
  switchMediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  switchMediaText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  mediaStripBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
  },
  thumbScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  thumbItem: {
    width: 42,
    height: 42,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: '#E2E8F0',
  },
  thumbItemActive: {
    borderColor: Theme.colors.primary,
  },
  thumbVideoItem: {
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbVideoIconOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadVideoBtn: {
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  downloadVideoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  downloadVideoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});

