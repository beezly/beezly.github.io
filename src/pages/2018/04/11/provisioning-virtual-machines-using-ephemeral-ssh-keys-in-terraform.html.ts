export async function GET() {
  return new Response(null, {
    status: 301,
    headers: {
      Location: '/provisioning-virtual-machines-using-ephemeral-ssh-keys-in-terraform/',
    },
  });
}
