import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Share,
  Platform,
  Linking,
  ActivityIndicator,
  StatusBar,
  Alert,
  Image,
  BackHandler,
  ScrollView,
  AppState,
  AppStateStatus,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useTemplate, useUseTemplateMutation } from '../../hooks/useTemplates';
import { Theme } from '../../constants/Theme';
import { resolveMediaUrl } from '../../utils/url';
import { adService } from '../../services/ads';
import { BannerAd } from '../../components/BannerAd';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TemplateVideoViewProps {
  videoUrl: string;
  thumbnailUrl?: string;
  isMuted: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const TemplateVideoView: React.FC<TemplateVideoViewProps> = ({
  videoUrl,
  thumbnailUrl,
  isMuted,
  isPlaying,
  onTogglePlay,
}) => {
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);

  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = isMuted;
    p.play();
  });

  useEffect(() => {
    if (!player) return;
    try {
      player.muted = isMuted;
    } catch (e) {}
  }, [isMuted, player]);

  useEffect(() => {
    if (!player) return;
    try {
      if (isPlaying) {
        player.play();
      } else {
        player.pause();
      }
    } catch (e) {}
  }, [isPlaying, player]);

  useEffect(() => {
    if (!player) return;

    const statusSub = player.addListener('statusChange', (payload) => {
      if (payload.status === 'readyToPlay') {
        setIsBuffering(false);
        setHasError(false);
        if (isPlaying) {
          player.play();
        }
      } else if (payload.status === 'loading') {
        setIsBuffering(true);
      } else if (payload.status === 'error') {
        console.warn('[expo-video] playback error:', payload.error);
        setIsBuffering(false);
        setHasError(true);
      }
    });

    const playingSub = player.addListener('playingChange', (payload) => {
      if (payload.isPlaying) {
        setIsBuffering(false);
      }
    });

    return () => {
      statusSub?.remove?.();
      playingSub?.remove?.();
    };
  }, [player, isPlaying]);

  // Resume playback immediately when app returns to foreground from background/external apps
  useEffect(() => {
    if (!player) return;

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'active' && isPlaying) {
        try {
          player.play();
        } catch (e) {
          try {
            player.replay();
          } catch (err) {}
        }
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [player, isPlaying]);

  const handleRetry = () => {
    setHasError(false);
    setIsBuffering(true);
    try {
      player.replay();
      player.play();
    } catch (e) {
      try {
        player.replace(videoUrl);
      } catch (err) {}
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onTogglePlay}
      style={styles.videoTouchable}
    >
      <VideoView
        player={player}
        style={styles.videoPlayer}
        nativeControls={false}
        contentFit="cover"
      />

      {/* Buffering spinner overlay */}
      {isBuffering && !hasError && (
        <View style={styles.bufferingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#FF3366" />
        </View>
      )}

      {/* Error state if video fails to stream */}
      {hasError && (
        <View style={styles.errorOverlay}>
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
              blurRadius={3}
            />
          ) : null}
          <View style={styles.errorContent}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF3366" />
            <Text style={styles.errorTitle}>Video Playback Error</Text>
            <Text style={styles.errorSubtitle}>
              Could not load video template. Tap below to retry.
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleRetry}
              style={styles.retryButton}
            >
              <Ionicons name="reload" size={16} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Retry Playback</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function TemplateDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    id: string;
    initialVideoUrl?: string;
    initialThumbnail?: string;
    initialTitle?: string;
    initialCategory?: string;
    initialIsVn?: string;
    initialVnImageUrl?: string;
  }>();
  const templateId = params.id ? parseInt(params.id, 10) : 0;

  const { data: templateData, isLoading, error } = useTemplate(templateId);
  const template = templateData?.template;
  const useTemplateMutation = useUseTemplateMutation();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isOpeningCapCut, setIsOpeningCapCut] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);

  // VN Swipe Mode
  const horizontalScrollRef = useRef<ScrollView>(null);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const isVn = template?.is_vn ?? (params.initialIsVn === 'true');
  const rawVnImageUrl = template?.vn_image_url || params.initialVnImageUrl || '';
  const vnImageSource = rawVnImageUrl ? resolveMediaUrl(rawVnImageUrl) : null;
  const canSwipeVn = Boolean(isVn && vnImageSource);

  const rawVideoUrl = template?.video_url || params.initialVideoUrl || '';
  const videoSource = resolveMediaUrl(rawVideoUrl);

  const rawThumbnailUrl = template?.thumbnail_url || params.initialThumbnail || '';
  const thumbnailSource = resolveMediaUrl(rawThumbnailUrl);

  const isLeavingRef = React.useRef(false);

  // Back handler: Pauses video and shows interstitial ad if enabled in admin panel
  const handleGoBack = React.useCallback(() => {
    if (isLeavingRef.current) return;
    isLeavingRef.current = true;

    // Pause video playback immediately
    setIsPlaying(false);

    adService.presentInterstitialOnTemplateBack(() => {
      router.back();
    });
  }, [router]);

  // Intercept Android hardware back button / swipe back gesture
  useEffect(() => {
    const onHardwareBack = () => {
      handleGoBack();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [handleGoBack]);

  // Resume video playback when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      isLeavingRef.current = false;
      if (activePageIndex === 0) {
        setIsPlaying(true);
      }
      return () => {
        setIsPlaying(false);
      };
    }, [activePageIndex])
  );

  // Resume video playback when app returns to foreground from external apps (e.g. CapCut)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        if (!isLeavingRef.current && activePageIndex === 0) {
          setIsPlaying(true);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        setIsPlaying(false);
      }
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [activePageIndex]);

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setIsPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    Haptics.selectionAsync().catch(() => {});
    setIsMuted((prev) => !prev);
  };

  const handleShare = async () => {
    const title = template?.title || params.initialTitle || 'CapCut Template';
    const targetUrl = template?.capcut_url || 'https://www.capcut.com/';
    Haptics.selectionAsync().catch(() => {});
    try {
      await Share.share({
        title,
        message: `Check out this trending CapCut template: "${title}"!\n${targetUrl}`,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const handleShareVnImage = async () => {
    if (!vnImageSource) return;
    Haptics.selectionAsync().catch(() => {});
    try {
      await Share.share({
        title: `${displayTitle} - VN Template Image`,
        message: `Check out this VN Preset / Template: "${displayTitle}"\n${vnImageSource}`,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const handleCopyVnLink = async () => {
    if (!vnImageSource) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    try {
      await Clipboard.setStringAsync(vnImageSource);
      Alert.alert('Link Copied', 'VN Template image URL has been copied to your clipboard!');
    } catch (e) {
      Alert.alert('VN Image', vnImageSource);
    }
  };

  const handleUseTemplate = async () => {
    if (!template) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setIsOpeningCapCut(true);

    // Pause video playback while external CapCut app is opening
    setIsPlaying(false);

    try {
      // 1. Increment template use count on backend
      useTemplateMutation.mutate(template.id);

      const targetUrl = template.capcut_url.trim();

      // 2. Attempt to open CapCut app or template URL
      const supported = await Linking.canOpenURL(targetUrl).catch(() => false);

      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
          await Linking.openURL(targetUrl);
        } else {
          const storeUrl =
            Platform.OS === 'ios'
              ? 'https://apps.apple.com/app/capcut-video-editor/id1500855883'
              : 'https://play.google.com/store/apps/details?id=com.lemon.lvoverseas';
          await Linking.openURL(storeUrl);
        }
      }
    } catch (err) {
      console.log('Error opening CapCut:', err);
      if (template.capcut_url) {
        Linking.openURL(template.capcut_url).catch(() => {
          Alert.alert('Notice', 'Could not open CapCut. Please ensure the app is installed.');
        });
      }
    } finally {
      setIsOpeningCapCut(false);
      // In case the user immediately returns or Linking doesn't trigger AppState change
      if (AppState.currentState === 'active' && activePageIndex === 0 && !isLeavingRef.current) {
        setIsPlaying(true);
      }
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const displayTitle = template?.title || params.initialTitle || '';
  const displayCategory = template?.category || params.initialCategory || '';

  // Render the Video Screen
  const renderVideoScreen = () => (
    <View style={styles.pageItem}>
      {/* Full Screen Instagram/Reel Video View */}
      {videoSource ? (
        <TemplateVideoView
          key={videoSource}
          videoUrl={videoSource}
          thumbnailUrl={thumbnailSource}
          isMuted={isMuted}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
        />
      ) : (
        <View style={styles.loadingContainer}>
          {thumbnailSource ? (
            <Image
              source={{ uri: thumbnailSource }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : null}
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Theme.colors.primaryLight} />
            <Text style={styles.loadingText}>Loading Video Template...</Text>
          </View>
        </View>
      )}

      {/* Center Paused Indicator */}
      {!isPlaying && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={togglePlay}
          style={styles.centerPlayButton}
        >
          <View style={styles.playIconCircle}>
            <Ionicons name="play" size={36} color="#FFFFFF" style={{ marginLeft: 4 }} />
          </View>
        </TouchableOpacity>
      )}

      {/* Subtle Top & Bottom Gradient Overlay for readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.65)', 'transparent', 'rgba(0,0,0,0.95)']}
        locations={[0, 0.25, 0.72]}
        pointerEvents="none"
        style={styles.gradientOverlay}
      />

      {/* Top Navigation Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleGoBack}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {canSwipeVn ? (
          /* Segmented Switch: Video / VN Image */
          <View style={styles.topTabsPill}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
                setIsPlaying(true);
              }}
              style={[styles.topTabBtn, activePageIndex === 0 && styles.topTabBtnActive]}
            >
              <Ionicons name="film" size={11} color="#FFFFFF" />
              <Text style={styles.topTabText}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                horizontalScrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
                setIsPlaying(false);
              }}
              style={[styles.topTabBtn, activePageIndex === 1 && styles.topTabBtnActiveVn]}
            >
              <Ionicons name="image" size={11} color="#FFFFFF" />
              <Text style={styles.topTabText}>VN Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.topBadge}>
            <Ionicons name="film" size={13} color="#FF3366" />
            <Text style={styles.topBadgeText}>CapCut Reel</Text>
          </View>
        )}

        <View style={styles.topRightActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleMute}
            style={styles.iconButton}
          >
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleShare}
            style={styles.iconButton}
          >
            <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Swipe Left Hint Pill on Video Screen */}
      {canSwipeVn && activePageIndex === 0 && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            horizontalScrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
            setIsPlaying(false);
          }}
          style={[styles.swipeHintBadge, { bottom: Math.max(insets.bottom, 16) + 160 }]}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.swipeHintGradient}
          >
            <Ionicons name="image" size={13} color="#FFFFFF" />
            <Text style={styles.swipeHintText}>Swipe left for VN Image</Text>
            <Ionicons name="chevron-forward" size={13} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Bottom Reel Style Info & "Use This Template" CTA */}
      {(template || displayTitle) && (
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          {/* Category & Duration Pill */}
          <View style={styles.pillRow}>
            {displayCategory ? (
              <View style={styles.categoryPill}>
                <Text style={styles.categoryPillText}>{displayCategory}</Text>
              </View>
            ) : null}

            {canSwipeVn ? (
              <View style={styles.vnCategoryPill}>
                <Ionicons name="image-outline" size={11} color="#FFFFFF" />
                <Text style={styles.vnCategoryPillText}>VN PRESET</Text>
              </View>
            ) : null}

            {template?.duration ? (
              <View style={styles.durationPill}>
                <Ionicons name="time-outline" size={12} color="#E2E8F0" />
                <Text style={styles.durationPillText}>{template.duration}</Text>
              </View>
            ) : null}

            {template?.use_count ? (
              <View style={styles.usesPill}>
                <Text style={styles.usesPillText}>
                  🔥 {formatNumber(template.use_count)} used
                </Text>
              </View>
            ) : null}
          </View>

          {/* Template Title */}
          <Text style={styles.templateTitle}>{displayTitle}</Text>

          {/* Description with Expand/Collapse */}
          {template?.description ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setShowFullDesc(!showFullDesc)}
            >
              <Text
                style={styles.templateDesc}
                numberOfLines={showFullDesc ? undefined : 2}
              >
                {template.description}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Tags */}
          {template?.tags && template.tags.length > 0 ? (
            <View style={styles.tagsRow}>
              {template.tags.slice(0, 4).map((tag, i) => (
                <Text key={i} style={styles.tagText}>
                  #{tag.trim()}
                </Text>
              ))}
            </View>
          ) : null}

          {/* Big CapCut CTA Button */}
          {template?.capcut_url ? (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={handleUseTemplate}
              disabled={isOpeningCapCut}
              style={styles.ctaButtonWrapper}
            >
              <LinearGradient
                colors={['#FF0055', '#E11D48', '#8B5CF6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                {isOpeningCapCut ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <View style={styles.capcutLogoCircle}>
                      <Ionicons name="cut" size={16} color="#FFFFFF" />
                    </View>
                    <Text style={styles.ctaButtonText}>USE THIS TEMPLATE</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : null}

          <Text style={styles.subtext}>
            Tapping opens CapCut app ready with this video effect
          </Text>

          {/* Ad Banner Below Use This Template Button (Controlled by Admin Panel) */}
          <View style={styles.templateAdBannerWrapper}>
            <BannerAd placement="template_detail" size="banner" />
          </View>
        </View>
      )}
    </View>
  );

  // Render the VN Image Screen (Revealed by swiping left)
  const renderVnImageScreen = () => (
    <View style={styles.pageItem}>
      <View style={styles.vnPageContainer}>
        {/* Full-size VN Image / QR Code */}
        {vnImageSource ? (
          <Image
            source={{ uri: vnImageSource }}
            style={styles.vnImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        )}

        {/* Top Navigation Bar on VN Page */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGoBack}
            style={styles.iconButton}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Segmented Switch: Video / VN Image */}
          <View style={styles.topTabsPill}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
                setIsPlaying(true);
              }}
              style={styles.topTabBtn}
            >
              <Ionicons name="film" size={11} color="rgba(255,255,255,0.7)" />
              <Text style={styles.topTabText}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.topTabBtn, styles.topTabBtnActiveVn]}
            >
              <Ionicons name="image" size={11} color="#FFFFFF" />
              <Text style={styles.topTabText}>VN Image</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.topRightActions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleShareVnImage}
              style={styles.iconButton}
            >
              <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Info Card for VN Image */}
        <View style={[styles.vnBottomCard, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
          <LinearGradient
            colors={['transparent', 'rgba(11, 15, 25, 0.95)', '#0B0F19']}
            locations={[0, 0.4, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          <View style={styles.vnHeaderRow}>
            <View style={styles.vnTagBadge}>
              <Ionicons name="qr-code-outline" size={12} color="#FFFFFF" />
              <Text style={styles.vnTagBadgeText}>VN CODE / PRESET</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                horizontalScrollRef.current?.scrollTo({ x: 0, animated: true });
                setIsPlaying(true);
              }}
              style={styles.backToVideoChip}
            >
              <Ionicons name="videocam-outline" size={12} color="#A78BFA" />
              <Text style={styles.backToVideoChipText}>👈 Back to Video</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.vnTitle}>{displayTitle}</Text>
          <Text style={styles.vnSubtitle}>
            Scan this QR code or import the preset photo into the VN Video Editor app to recreate this viral reel.
          </Text>

          {/* VN Actions */}
          <View style={styles.vnActionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleCopyVnLink}
              style={styles.vnActionBtn}
            >
              <Ionicons name="copy-outline" size={15} color="#FFFFFF" />
              <Text style={styles.vnActionBtnText}>Copy Link</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleShareVnImage}
              style={styles.vnActionBtn}
            >
              <Ionicons name="share-social-outline" size={15} color="#FFFFFF" />
              <Text style={styles.vnActionBtnText}>Share</Text>
            </TouchableOpacity>

            {template?.capcut_url ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={handleUseTemplate}
                style={styles.vnCtaWrapper}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#6D28D9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.vnCtaButton}
                >
                  <Text style={styles.vnCtaButtonText}>OPEN APP</Text>
                  <Ionicons name="open-outline" size={14} color="#FFFFFF" />
                </LinearGradient>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {canSwipeVn ? (
        /* Horizontal Pager: Swipe left to see VN Image */
        <ScrollView
          ref={horizontalScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onMomentumScrollEnd={(e) => {
            const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setActivePageIndex(page);
            if (page === 1) {
              // Pause video on image page
              setIsPlaying(false);
            } else {
              // Resume playback on video page
              setIsPlaying(true);
            }
          }}
          style={styles.pagerScrollView}
        >
          {renderVideoScreen()}
          {renderVnImageScreen()}
        </ScrollView>
      ) : (
        renderVideoScreen()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  videoTouchable: {
    ...StyleSheet.absoluteFill,
  },
  videoPlayer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  bufferingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A12',
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    paddingVertical: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 24,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  errorSubtitle: {
    color: '#94A3B8',
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FF3366',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0A0A12',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 18, 0.85)',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  centerPlayButton: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  playIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 5,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  topBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  topRightActions: {
    flexDirection: 'row',
    gap: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 18,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  categoryPillText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  durationPillText: {
    color: '#E2E8F0',
    fontSize: 10.5,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  usesPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  usesPillText: {
    color: '#FFD700',
    fontSize: 10.5,
    fontWeight: '700',
  },
  templateTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
    lineHeight: 26,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 6,
  },
  templateDesc: {
    color: '#E2E8F0',
    fontSize: 12.5,
    lineHeight: 18,
    opacity: 0.95,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  tagText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '600',
  },
  ctaButtonWrapper: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#FF0055',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    gap: 10,
  },
  capcutLogoCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtext: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 10.5,
    textAlign: 'center',
    marginTop: 8,
  },
  templateAdBannerWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  // Pager & Horizontal Swipe Styles
  pagerScrollView: {
    flex: 1,
    width: SCREEN_WIDTH,
  },
  pageItem: {
    width: SCREEN_WIDTH,
    height: '100%',
    position: 'relative',
    backgroundColor: '#000000',
  },
  // Top Tabs Pill
  topTabsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 22,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  topTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
  },
  topTabBtnActive: {
    backgroundColor: '#FF3366',
  },
  topTabBtnActiveVn: {
    backgroundColor: '#8B5CF6',
  },
  topTabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '700',
  },
  topTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  // Swipe Left Prompt Floating Hint
  swipeHintBadge: {
    position: 'absolute',
    right: 16,
    zIndex: 25,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  swipeHintGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  swipeHintText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  vnCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  vnCategoryPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  // VN Page Layout & Styles
  vnPageContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: '#070A12',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  vnImage: {
    width: SCREEN_WIDTH - 24,
    height: SCREEN_HEIGHT * 0.62,
    borderRadius: 18,
    backgroundColor: '#000000',
  },
  vnBottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 18,
    paddingTop: 36,
  },
  vnHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vnTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vnTagBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  backToVideoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  backToVideoChipText: {
    color: '#DDD6FE',
    fontSize: 11,
    fontWeight: '700',
  },
  vnTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  vnSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 14,
  },
  vnActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vnActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  vnActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  vnCtaWrapper: {
    flex: 1.3,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  vnCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  vnCtaButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
