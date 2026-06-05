'use client';

import { useEffect, useState } from 'react';

export const useChatFile = (fileUrl: string) => {
  const [publicUrl, setPublicUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (fileUrl) {
      setPublicUrl(fileUrl);

      if (
        fileUrl.match(/\.(webp|jpg|jpeg|png|gif|svg)$/i) ||
        fileUrl.includes('utfs.io')
      ) {
        setFileType('image');
      } else if (fileUrl.match(/\.pdf$/i)) {
        setFileType('pdf');
      }
      setLoading(false);
    }
  }, [fileUrl]);

  return { publicUrl, fileType, loading };
};
