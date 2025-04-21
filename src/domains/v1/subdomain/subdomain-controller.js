import axios from "axios";
import client from "../../../config/cloudflare.js";
import BaseError from "../../../base_classes/base-error.js";
import { successResponse } from "../../../utils/response.js";
import { symlink, writeFile } from "fs";
import { exec } from "child_process";

class SubdomainController {
    async index() {
        throw new Error("Method not implemented");
    }

    async show() {
        throw new Error("Method not implemented");
    }

    async create(req, res) {
        const { user_id, bussiness_id, name } = req.body;

        const fullDomain = `${name}.${process.env.DOMAIN}`

        const dnsRecord = {
            type: "A",
            name: fullDomain,
            content: process.env.IP,
            ttl: 3600,
            proxied: true,
        }
   
        const response = await client.dns.records.create({
            zone_id: process.env.CLOUDFLARE_ZONE_ID,
            ...dnsRecord,
        }).catch((error) => {
            console.log(error);
            throw BaseError.badRequest(error.errors[0].message);
        })

        const nginxConfig =
            `server {
                listen 80;
                server_name ${fullDomain};
                root ${process.env.PREFIX}/${user_id}/${bussiness_id};
                location / {
                    return 404;
                }
            }`
        const nginxFilePath = `/home/kanzen/HijiData/nginx/sites-available/${fullDomain}`

        writeFile(nginxFilePath, nginxConfig, (err) => {
            if (err) {
                console.error(err);                
            }
        })

        symlink(nginxFilePath, `/home/kanzen/HijiData/nginx/sites-enabled/${fullDomain}`, (err) => {
            if (err) {
                console.error(err);
            }
        })

        exec("sudo systemctl reload nginx", (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });
        
        return successResponse(res, {
            message: "Subdomain created successfully",
            data: {
                dnsRecord: response,
                nginxConfig: nginxFilePath,

            }
        })
    }

    async update() {
        throw new Error("Method not implemented");
    }

    async delete() {
        throw new Error("Method not implemented");
    }
}

export default new SubdomainController();