
export async function getUserData() {
  const supabase = await createUploadSafeClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.log('Auth error:', error);
    return null;
  }

  const { data, error: queryError } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (queryError) {
    console.log('Query error:', queryError);
    return null;
  }

  return data;
}

// export const getUserDataPages = async (
//   req: NextApiRequest,
//   res: NextApiResponse
// ): Promise<User | null> => {
//   const supabase = supabaseServerClientPages(req, res);

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (!user) {
//     console.log('NO USER', user);
//     return null;
//   }

//   const { data, error } = await supabase
//     .from('users')
//     .select('*')
//     .eq('id', user.id);

//   if (error) {
//     console.log(error);
//     return null;
//   }

//   return data ? data[0] : null;
// };
