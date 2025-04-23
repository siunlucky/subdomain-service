import axios from "axios";
import client from "../../../config/cloudflare.js";
import BaseError from "../../../base_classes/base-error.js";
import { successResponse } from "../../../utils/response.js";
import { appendFile, readFile, symlink, writeFile } from "fs";
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
                nginxConfig: nginxFilePath,
            }
        })
    }

    async update() {
        throw new Error("Method not implemented");
    }

    async delete(req, res) {
        const { name, dns_id } = req.body;

        console.log(dns_id);

        const fullDomain = `${name}.${process.env.DOMAIN}`

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

    async addSlug(req, res) {
        const { name, user_id, bussiness_id, slug, page_id } = req.body;

        const fullDomain = `${name}.${process.env.DOMAIN}`;
        const nginxFilePath = `${process.env.CONFIG_PREFIX}/sites-available/${fullDomain}.conf`;

        const slugLocationBlock = `
        location /${slug} {
            index index.html;
            alias ${process.env.PREFIX}/${user_id}/${bussiness_id}/${page_id}/;
        }`;

        readFile(nginxFilePath, "utf8", (readErr, data) => {
            if (readErr) {
                console.error("Gagal membaca file config:", readErr);
                return res.status(400).json({ message: "Konfigurasi domain tidak ditemukan" });
            }

            if (data.includes(`location /${slug}`)) {
                return res.status(400).json({ message: "Slug sudah digunakan dalam domain ini" });
            }

            // Cari posisi penutup terakhir "}" dari server block
            const lastBracketIndex = data.lastIndexOf("}");

            if (lastBracketIndex === -1) {
                return res.status(500).json({ message: "Format konfigurasi nginx tidak valid" });
            }

            // Sisipkan slug block sebelum penutup server block
            const updatedData = data.slice(0, lastBracketIndex) + slugLocationBlock + "\n}" + data.slice(lastBracketIndex + 1);

            writeFile(nginxFilePath, updatedData, "utf8", (writeErr) => {
                if (writeErr) {
                    console.error("Gagal menulis ulang konfigurasi:", writeErr);
                    return res.status(500).json({ message: "Gagal menyimpan konfigurasi slug" });
                }

                exec("sudo systemctl reload nginx", (error, stdout, stderr) => {
                    if (error) {
                        console.error("Gagal reload nginx:", error);
                        return res.status(500).json({ message: "Reload nginx gagal" });
                    }

                    return res.status(200).json({
                        message: "Slug berhasil ditambahkan ke subdomain",
                        slug,
                        domain: fullDomain,
                        page_path: `${process.env.PREFIX}/${user_id}/${bussiness_id}/${page_id}/`
                    });
                });
            });
        });
    }


    async deleteSlug(req, res) {
        const { name, slug } = req.body;

        const fullDomain = `${name}.${process.env.DOMAIN}`;
        const nginxFilePath = `${process.env.CONFIG_PREFIX}/sites-available/${fullDomain}.conf`

        // Baca isi file nginx
        readFile(nginxFilePath, 'utf8', (readErr, data) => {
            if (readErr) {
                console.error("Gagal membaca file config:", readErr);
                throw BaseError.badRequest("Konfigurasi domain tidak ditemukan");
            }

            // Regex untuk mencari blok location slug (baris indentasi bisa bervariasi)
            const slugBlockRegex = new RegExp(`\\n\\s*location\\s+\\/${slug}\\s*\\{[\\s\\S]*?\\}`, 'g');

            if (!slugBlockRegex.test(data)) {
                throw BaseError.badRequest("Slug tidak ditemukan dalam konfigurasi");
            }

            // Hapus blok slug
            const updatedConfig = data.replace(slugBlockRegex, '');

            // Tulis ulang file config tanpa blok slug
            writeFile(nginxFilePath, updatedConfig, 'utf8', (writeErr) => {
                if (writeErr) {
                    console.error("Gagal menulis ulang konfigurasi:", writeErr);
                    throw Error("Gagal memperbarui konfigurasi");
                }

                // Reload nginx
                exec("sudo systemctl reload nginx", (error, stdout, stderr) => {
                    if (error) {
                        console.error("Gagal reload nginx:", error);
                        throw Error("Gagal reload nginx");
                    }

                    return successResponse(res, {
                        message: "Slug berhasil dihapus dari subdomain",
                        slug,
                        domain: fullDomain
                    });
                });
            });
        });
    }
}

export default new SubdomainController();