export type User = {
  name: string;
  email: string;
};

export type Note = {
  id: string;
  title: string;
  date: Date;
  folder: string;
  summary: string;
  tags: string[];
};
