import type { Brain, Expert, FileMetadata } from '@prisma/client';

interface BrainWithFiles extends Brain {
  files: FileMetadata[];
}

interface ExpertWithBrains extends Expert {
  brains: BrainWithFiles[];
}

interface ExpertSummary {
  expertSize: number;
  brainSizes: number[];
}

interface BrainSummary {
  brainSize: number;
  brainSizes: number[];
}

export function calculateExpertsSizes(experts: ExpertWithBrains[]): [number[], number] {
  let totalSize = 0;
  const sizes: number[] = [];

  experts.forEach((expert) => {
    const brainSummary = expert?.brains?.reduce(
      (summary, brain) => {
        const brainSize = brain.files.reduce((size, file) => size + file.wordCount, 0);
        return {
          expertSize: summary.expertSize + brainSize,
          brainSizes: [...summary.brainSizes, brainSize],
        };
      },
      { expertSize: 0, brainSizes: [] } as ExpertSummary
    );

    sizes.push(brainSummary.expertSize);
    totalSize += brainSummary.expertSize;
  });

  return [sizes, totalSize];
}

export function calculateExpertSizes(expert: ExpertWithBrains): [number[], number] {
  let totalSize = 0;
  const sizes: number[] = [];

  expert.brains.forEach((brain) => {
    const brainSummary = brain?.files?.reduce(
      (summary, file) => {
        const fileSize = file?.wordCount || 0;
        return {
          brainSize: summary.brainSize + fileSize,
          brainSizes: [...summary.brainSizes, fileSize],
        };
      },
      { brainSize: 0, brainSizes: [] } as BrainSummary
    );

    if (brainSummary) {
      sizes.push(brainSummary.brainSize);
      totalSize += brainSummary.brainSize;
    }
  });

  return [sizes, totalSize];
}

export function calculateBrainSizes(brains: BrainWithFiles[]): [number[], number] {
  let totalSize = 0;
  const sizes: number[] = [];

  brains.forEach((brain) => {
    const brainSummary = brain?.files?.reduce(
      (summary, file: FileMetadata) => {
        const fileSize = file?.wordCount || 0;
        return {
          brainSize: summary.brainSize + fileSize,
          brainSizes: [...summary.brainSizes, fileSize],
        };
      },
      { brainSize: 0, brainSizes: [] } as { brainSize: number; brainSizes: number[] }
    );

    if (brainSummary) {
      sizes.push(brainSummary.brainSize);
      totalSize += brainSummary.brainSize;
    }
  });

  return [sizes, totalSize];
}
