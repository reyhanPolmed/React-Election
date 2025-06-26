-- Create sample election
INSERT INTO elections (
  title,
  description,
  startDate,
  endDate,
  status,
  maxVotesPerUser,
  createdAt,
  updatedAt
) VALUES (
  'Pemilihan Presiden 2024',
  'Pemilihan Presiden dan Wakil Presiden Republik Indonesia Tahun 2024',
  '2024-02-14 07:00:00',
  '2024-02-14 13:00:00',
  'upcoming',
  1,
  NOW(),
  NOW()
);

-- Get the election ID (assuming it's 1 for this example)
SET @election_id = LAST_INSERT_ID();

-- Create sample candidates
INSERT INTO candidates (
  name,
  party,
  description,
  candidateNumber,
  electionId,
  voteCount,
  createdAt,
  updatedAt
) VALUES 
(
  'Anies Rasyid Baswedan & Muhaimin Iskandar',
  'Koalisi Perubahan',
  'Pasangan calon nomor urut 1',
  1,
  @election_id,
  0,
  NOW(),
  NOW()
),
(
  'Prabowo Subianto & Gibran Rakabuming Raka',
  'Koalisi Indonesia Maju',
  'Pasangan calon nomor urut 2',
  2,
  @election_id,
  0,
  NOW(),
  NOW()
),
(
  'Ganjar Pranowo & Mahfud MD',
  'Koalisi Perubahan untuk Persatuan',
  'Pasangan calon nomor urut 3',
  3,
  @election_id,
  0,
  NOW(),
  NOW()
);
