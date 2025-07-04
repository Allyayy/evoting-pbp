const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: userEmail,
  password: userPassword,
});

if (!signUpError) {
  // Simpan NIM ke tabel users
  const { error: insertError } = await supabase
    .from('users')
    .insert([{ id: signUpData.user.id, nim: userNim, email: userEmail }]);
  if (insertError) console.error(insertError);
}
