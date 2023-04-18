import type { Assistant, Brain, FileMetadata } from '@prisma/client';

interface BrainWithFiles extends Brain {
  files: FileMetadata[];
}

interface AssistantWithBrains extends Assistant {
  brains: BrainWithFiles[];
}

interface AssistantSummary {
  assistantSize: number;
  brainSizes: number[];
}

interface BrainSummary {
  brainSize: number;
  brainSizes: number[];
}

export function calculateAssistantsSizes(assistants: AssistantWithBrains[]): [number[], number] {
  let totalSize = 0;
  const sizes: number[] = [];

  assistants.forEach((assistant) => {
    const brainSummary = assistant?.brains?.reduce(
      (summary, brain) => {
        const brainSize = brain.files.reduce((size, file) => size + file.wordCount, 0);
        return {
          assistantSize: summary.assistantSize + brainSize,
          brainSizes: [...summary.brainSizes, brainSize],
        };
      },
      { assistantSize: 0, brainSizes: [] } as AssistantSummary
    );

    sizes.push(brainSummary.assistantSize);
    totalSize += brainSummary.assistantSize;
  });

  return [sizes, totalSize];
}

export function calculateAssistantSizes(assistant: AssistantWithBrains): [number[], number] {
  let totalSize = 0;
  const sizes: number[] = [];

  assistant.brains.forEach((brain) => {
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
