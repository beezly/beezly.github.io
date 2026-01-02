export async function GET() {
  return new Response(null, {
    status: 301,
    headers: {
      Location: '/authenticating-azure-users-with-hashicorp-vault/',
    },
  });
}
