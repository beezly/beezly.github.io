export async function GET() {
  return new Response(null, {
    status: 301,
    headers: {
      Location: '/migrating-an-lvm-logical-volume-onto-a-new-block-device-without-downtime/',
    },
  });
}
