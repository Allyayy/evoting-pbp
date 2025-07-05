import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseclient';

function App() {
  // Ganti dengan UUID poll yang valid di tabel polls
  const pollId = '0cd4176a-ea14-47f5-8679-dac50f3e2147'; // contoh UUID poll

  // Simulasi userId statis (ganti dengan UUID valid dari tabel pemilih di Supabase)
  const userId = '2598737e-aafd-45c3-8c10-b4351b6697e5';

  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [votesCount, setVotesCount] = useState({});

  // Fetch polling dan opsi dari tabel polls dan options
  async function fetchPoll() {
    try {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          id,
          judul,
          deskripsi,
          options (
            id,
            kandidat_id,
            nomor_urut
          )
        `)
        .eq('id', pollId)
        .single();

      if (error) {
        console.error('Error fetch poll:', error);
        return;
      }

      // Supabase tidak otomatis urutkan nested options, urutkan manual berdasarkan nomor_urut
      if (data?.options) {
        data.options.sort((a, b) => a.nomor_urut - b.nomor_urut);
      }

      setPoll(data);
    } catch (err) {
      console.error('Unexpected error fetch poll:', err);
    }
  }

  // Cek apakah user sudah voting
  async function checkVote() {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('id, option_id')
        .eq('poll_id', pollId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error checking vote:', error);
        return;
      }
      if (data) {
        setHasVoted(true);
        setSelectedOption(data.option_id);
      } else {
        setHasVoted(false);
        setSelectedOption(null);
      }
    } catch (err) {
      console.error('Unexpected error check vote:', err);
    }
  }

  // Hitung jumlah suara per opsi
  async function fetchVotesCount() {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('option_id');

      if (error) {
        console.error('Error fetching votes:', error);
        return;
      }
      const counts = {};
      data.forEach(vote => {
        counts[vote.option_id] = (counts[vote.option_id] || 0) + 1;
      });
      setVotesCount(counts);
    } catch (err) {
      console.error('Unexpected error fetching votes count:', err);
    }
  }

  // Kirim vote
  async function submitVote() {
    if (!selectedOption) {
      alert('Pilih opsi terlebih dahulu');
      return;
    }
    try {
      const { error } = await supabase
        .from('votes')
        .insert([{ user_id: userId, poll_id: pollId, option_id: selectedOption }]);
      if (error) throw error;

      setHasVoted(true);
      alert('Vote berhasil!');
    } catch (err) {
      alert('Gagal vote: ' + err.message);
    }
  }

  // Setup realtime subscription untuk update suara
  useEffect(() => {
    fetchPoll();
    checkVote();
    fetchVotesCount();

    const channel = supabase
      .channel(`poll-${pollId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'votes',
        filter: `poll_id=eq.${pollId}`
      }, () => {
        fetchVotesCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!poll) return <div>Loading polling...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>{poll.judul}</h1>
      {poll.deskripsi && <p>{poll.deskripsi}</p>}

      {poll.options.map(option => (
        <div key={option.id} style={{ marginBottom: 10 }}>
          <label>
            <input
              type="radio"
              name="option"
              value={option.id}
              disabled={hasVoted}
              checked={selectedOption === option.id}
              onChange={() => setSelectedOption(option.id)}
            />
            {' '}
            Kandidat ID: {option.kandidat_id} (Urut: {option.nomor_urut})
          </label>
          {hasVoted && (
            <span style={{ marginLeft: 10, fontWeight: 'bold' }}>
              {votesCount[option.id] || 0} suara
            </span>
          )}
        </div>
      ))}

      {!hasVoted ? (
        <button onClick={submitVote} disabled={!selectedOption}>
          Kirim Vote
        </button>
      ) : (
        <p>Terima kasih sudah memberikan suara!</p>
      )}
    </div>
  );
}

export default App;
