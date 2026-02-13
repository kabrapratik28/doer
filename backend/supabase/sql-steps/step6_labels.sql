CREATE TABLE public.labels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#808080',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_labels_user_id ON public.labels(user_id);
CREATE UNIQUE INDEX idx_labels_unique_name ON public.labels(user_id, name);

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own labels" ON public.labels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.task_labels (
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  label_id UUID NOT NULL REFERENCES public.labels(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, label_id)
);

CREATE INDEX idx_task_labels_task_id ON public.task_labels(task_id);
CREATE INDEX idx_task_labels_label_id ON public.task_labels(label_id);

ALTER TABLE public.task_labels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own task_labels" ON public.task_labels FOR ALL
  USING (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.tasks WHERE tasks.id = task_labels.task_id AND tasks.user_id = auth.uid()));
