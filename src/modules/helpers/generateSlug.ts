import { randomUUID } from "crypto";


const slugify = (name: string) => {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
}


const generateSlug = (name: string) => {
    const base = slugify(name);
    const suffix = randomUUID().split("-")[0];
    return `${base}-${suffix}`
}

export default generateSlug;