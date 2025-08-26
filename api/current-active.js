export default async function handler(request, response) {
  const res = await fetch('https://hackatime.hackclub.com/static_pages/currently_hacking_count');
  const data = await res.json();
  response.status(200).json(data);
}
