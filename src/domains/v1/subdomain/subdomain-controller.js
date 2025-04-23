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
        console.log(req.body);
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

        // console.log(response);

        const nginxConfig =
            `server {
                listen 80;
                server_name ${fullDomain};
                root ${process.env.PREFIX}/${user_id}/${bussiness_id};
                location / {
                    return 404;
                }
            }`
        const nginxFilePath = `${process.env.CONFIG_PREFIX}/sites-available/${fullDomain}.conf`

        writeFile(nginxFilePath, nginxConfig, (err) => {
            if (err) {
                console.error(err);                
            }
        })

        symlink(nginxFilePath, `${process.env.CONFIG_PREFIX}/sites-enabled/${fullDomain}.conf`, (err) => {
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
                dnsRecordId: response.id,
                dnsName: response.name,
                // nginxConfig: nginxFilePath,
            }
        })
    }

    async update() {
        throw new Error("Method not implemented");
    }

    async delete(req, res) {
        const { dns_id } = req.body;

        console.log(dns_id);

        // const fullDomain = `${name}.${process.env.DOMAIN}`

        const response = await client.dns.records.delete(dns_id, {
            zone_id: process.env.CLOUDFLARE_ZONE_ID
        }).catch((error) => {
            console.log(error);
            throw BaseError.badRequest(error.errors[0].message);
        })


        const nginxFilePath = `${process.env.CONFIG_PREFIX}/sites-available/${fullDomain}.conf`
        exec(`rm ${nginxFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        })

        exec(`rm ${process.env.CONFIG_PREFIX}/sites-enabled/${fullDomain}.conf`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        })

        exec("sudo systemctl reload nginx", (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
        });

        return successResponse(res, {
            message: "Subdomain deleted successfully",
            data: {
                dnsRecord: response,
            }
        });
    }
}

export default new SubdomainController();