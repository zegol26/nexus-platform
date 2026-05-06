export type RecordingRowForGrouping = {
  id: string;
  userId: string;
  questionId: string;
  submittedAt: Date;
  user: {
    name: string | null;
    email: string;
  };
  question: {
    order: number;
    prompt: string;
    focusArea: string;
  };
};

export type QuestionRecordingGroup<T extends RecordingRowForGrouping = RecordingRowForGrouping> = {
  questionId: string;
  order: number;
  prompt: string;
  focusArea: string;
  recordings: T[];
};

export type UserRecordingGroup<T extends RecordingRowForGrouping = RecordingRowForGrouping> = {
  userId: string;
  label: string;
  email: string;
  questions: QuestionRecordingGroup<T>[];
  total: number;
};

export function groupRecordings<T extends RecordingRowForGrouping>(recordings: T[]): UserRecordingGroup<T>[] {
  const users = new Map<string, UserRecordingGroup<T>>();

  for (const recording of recordings) {
    const existingUser = users.get(recording.userId);
    const user =
      existingUser ??
      ({
        userId: recording.userId,
        label: recording.user.name ?? recording.user.email,
        email: recording.user.email,
        questions: [],
        total: 0,
      } satisfies UserRecordingGroup<T>);

    let question = user.questions.find((item) => item.questionId === recording.questionId);
    if (!question) {
      question = {
        questionId: recording.questionId,
        order: recording.question.order,
        prompt: recording.question.prompt,
        focusArea: recording.question.focusArea,
        recordings: [],
      };
      user.questions.push(question);
    }

    question.recordings.push(recording);
    user.total += 1;
    users.set(recording.userId, user);
  }

  return Array.from(users.values()).map((user) => ({
    ...user,
    questions: user.questions
      .map((question) => ({
        ...question,
        recordings: question.recordings.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime()),
      }))
      .sort((a, b) => a.order - b.order),
  }));
}
