import { useEffect } from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadProvider, useUpload } from './UploadContext';

const mocks = vi.hoisted(() => {
  const toast = vi.fn();
  toast.success = vi.fn();
  toast.error = vi.fn();

  return {
    navigate: vi.fn(),
    publishVideo: vi.fn(),
    saveUploadPayload: vi.fn(),
    getUploadPayload: vi.fn(),
    deleteUploadPayload: vi.fn(),
    toast,
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  };
});

vi.mock('../api/services/video.service', () => ({
  videoService: {
    publishVideo: (...args) => mocks.publishVideo(...args),
    initChunkedVideoUpload: vi.fn(),
    uploadVideoChunk: vi.fn(),
    getChunkedUploadStatus: vi.fn(),
    completeChunkedVideoUpload: vi.fn(),
    cancelChunkedVideoUpload: vi.fn(),
  },
}));

vi.mock('../utils/uploadPayloadStore', () => ({
  saveUploadPayload: (...args) => mocks.saveUploadPayload(...args),
  getUploadPayload: (...args) => mocks.getUploadPayload(...args),
  deleteUploadPayload: (...args) => mocks.deleteUploadPayload(...args),
}));

vi.mock('react-hot-toast', () => ({
  default: mocks.toast,
}));

function Harness({ onContext }) {
  const upload = useUpload();

  useEffect(() => {
    onContext(upload);
  }, [upload, onContext]);

  return null;
}

const renderUploadProvider = (onContext) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <UploadProvider>
        <Harness onContext={onContext} />
      </UploadProvider>
    </QueryClientProvider>
  );
};

const createVideoFile = () =>
  new File([new Uint8Array([1, 2, 3, 4])], 'demo.mp4', { type: 'video/mp4' });

describe('UploadContext transitions', () => {
  beforeEach(() => {
    localStorage.clear();
    mocks.navigate.mockReset();
    mocks.publishVideo.mockReset();
    mocks.saveUploadPayload.mockReset();
    mocks.getUploadPayload.mockReset();
    mocks.deleteUploadPayload.mockReset();
    mocks.toast.mockReset();
    mocks.toast.success.mockReset();
    mocks.toast.error.mockReset();

    mocks.saveUploadPayload.mockResolvedValue(true);
    mocks.getUploadPayload.mockResolvedValue(null);
    mocks.deleteUploadPayload.mockResolvedValue(true);
  });

  it('moves queued -> uploading -> done', async () => {
    mocks.publishVideo.mockImplementation(async (_body, onUploadProgress) => {
      onUploadProgress({ loaded: 4, total: 4 });
      return { _id: 'video-123' };
    });

    let ctx;
    renderUploadProvider((value) => {
      ctx = value;
    });

    await waitFor(() => expect(ctx).toBeTruthy());

    await act(async () => {
      await ctx.startUpload(
        {
          title: 'My upload',
          description: '',
          tags: '',
          videoFile: createVideoFile(),
          thumbnail: null,
        },
        { title: 'My upload', thumbnailUrl: null }
      );
    });

    await waitFor(() => {
      expect(ctx.pendingUploads[0].status).toBe('done');
    });

    expect(ctx.pendingUploads[0].videoId).toBe('video-123');
  });

  it('moves queued -> uploading -> error on failed upload', async () => {
    mocks.publishVideo.mockRejectedValue(new Error('Upload failed from server'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      let ctx;
      renderUploadProvider((value) => {
        ctx = value;
      });

      await waitFor(() => expect(ctx).toBeTruthy());

      await act(async () => {
        await ctx.startUpload(
          {
            title: 'Broken upload',
            description: '',
            tags: '',
            videoFile: createVideoFile(),
            thumbnail: null,
          },
          { title: 'Broken upload', thumbnailUrl: null }
        );
      });

      await waitFor(() => {
        expect(ctx.pendingUploads[0].status).toBe('error');
      });

      expect(ctx.pendingUploads[0].errorMessage).toContain('Upload failed');
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it('moves uploading -> canceled when dismissing upload', async () => {
    mocks.publishVideo.mockImplementation((_body, _onUploadProgress, signal) =>
      new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          const canceledError = new Error('canceled');
          canceledError.code = 'ERR_CANCELED';
          reject(canceledError);
        });
      })
    );

    let ctx;
    renderUploadProvider((value) => {
      ctx = value;
    });

    await waitFor(() => expect(ctx).toBeTruthy());

    let uploadId;
    await act(async () => {
      uploadId = await ctx.startUpload(
        {
          title: 'Cancel upload',
          description: '',
          tags: '',
          videoFile: createVideoFile(),
          thumbnail: null,
        },
        { title: 'Cancel upload', thumbnailUrl: null }
      );
    });

    await waitFor(() => {
      expect(ctx.pendingUploads[0].status).toBe('uploading');
    });

    await act(async () => {
      ctx.dismissUpload(uploadId, 'Canceled in test');
    });

    await waitFor(() => {
      expect(ctx.pendingUploads[0].status).toBe('canceled');
    });

    expect(ctx.pendingUploads[0].cancelReason).toBe('Canceled in test');
  });
});
