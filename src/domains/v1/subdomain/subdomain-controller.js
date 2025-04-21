class SubdomainController {
    async index() {
        throw new Error("Method not implemented");
    }

    async show() {
        const { subdomain } = req.params;
    }

    async create(req, res) {
        const { user_id, bussiness_id, name, config } = req.body;
        
        const fullDdomain = `${name}.${process.env.DOMAIN}`

        try {
            const dnsRecord = {
                type: "A",
                name: fullDdomain,
                content: process.env.SERVER_IP,
                ttl: 3600,
                proxied: false,
            }

            await axios.post(
                `https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/dns_records`,
                dnsRecord,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                }
            )

            const nginxConfig =
                `server {
                    listen 80;
                    server_name ${fullDdomain};
                    root ${config}/${user_id}/${bussiness_id};
                    location / {
                        return 404;
                    }
                }`
            const nginxFilePath = `/etc/nginx/sites-available/${fullDdomain}`
            fs.writeFile(nginxFilePath, nginxConfig, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        message: "Internal Server Error",
                        error: err.message,
                    });
                }
            }
            )
            fs.symlink(nginxFilePath, `/etc/nginx/sites-enabled/${fullDdomain}`, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        message: "Internal Server Error",
                        error: err.message,
                    });
                }
            })
            exec("nginx -s reload", (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.status(500).json({
                        message: "Internal Server Error",
                        error: error.message,
                    });
                }
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
            });

            return res.status(200).json({
                message: "Subdomain created successfully",
                data: {
                    subdomain: fullDdomain,
                    config: nginxConfig,
                },
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Internal Server Error",
                error: error.message,
            });
        }
    }

    async update() {
        throw new Error("Method not implemented");
    }

    async delete() {
        throw new Error("Method not implemented");
    }
}

export default new SubdomainController();