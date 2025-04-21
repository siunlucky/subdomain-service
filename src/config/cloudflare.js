import Cloudflare from "cloudflare";

const client = new Cloudflare({
    apiEmail: process.env.CLOUDFLARE_EMAIL,
    apiToken: process.env.CLOUDFLARE_API_TOKENN,
})

export default client;