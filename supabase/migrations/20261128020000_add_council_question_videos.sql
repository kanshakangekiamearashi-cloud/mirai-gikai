-- 市議会向け拡張: 一般質問・代表質問の公式動画リンクのテーブルを追加する。
-- 東広島市議会公式YouTubeチャンネル「東広島市議会本会議場」の動画を、
-- 質問者と登壇日が動画タイトルで確認できるものだけ収録する。

create table council_question_videos (
  id uuid primary key default gen_random_uuid(),
  diet_session_id uuid not null references diet_sessions(id) on delete cascade,
  speaker_name text not null,
  asked_on date not null,
  youtube_url text not null,
  video_title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (diet_session_id, speaker_name, asked_on)
);

alter table council_question_videos enable row level security;

create trigger update_council_question_videos_updated_at
  before update on council_question_videos
  for each row
  execute function update_updated_at_column();

comment on table council_question_videos is '一般質問・代表質問の公式動画リンク（YouTube東広島市議会本会議場）。動画タイトルで質問者・登壇日を確認できたもののみ収録';
comment on column council_question_videos.speaker_name is '質問者名（general_questions.speaker_name と同一表記）';
comment on column council_question_videos.asked_on is '登壇日（general_questions.asked_on と一致させる）';
comment on column council_question_videos.video_title is 'YouTube動画のタイトル（照合根拠として保持）';
