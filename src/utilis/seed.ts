/* eslint-disable @typescript-eslint/no-explicit-any */


import { prisma } from "../lib/prisma";
import { envVars } from "../config/env";
import { auth } from "../lib/auth";
import { Role, UserStatus } from "../generated/enums";

const DEMO_CLIENT_EMAIL = process.env.DEMO_CLIENT_EMAIL || "client@consultedge.demo";
const DEMO_CLIENT_PASSWORD = process.env.DEMO_CLIENT_PASSWORD || "Demo@12345";
const DEMO_CLIENT_NAME = process.env.DEMO_CLIENT_NAME || "Demo Client";

const DEMO_EXPERT_EMAIL = process.env.DEMO_EXPERT_EMAIL || "expert@consultedge.demo";
const DEMO_EXPERT_PASSWORD = process.env.DEMO_EXPERT_PASSWORD || "Demo@12345";
const DEMO_EXPERT_NAME = process.env.DEMO_EXPERT_NAME || "Demo Expert";

const DEMO_ADMIN_EMAIL = process.env.DEMO_ADMIN_EMAIL || "admin@consultedge.demo";
const DEMO_ADMIN_PASSWORD = process.env.DEMO_ADMIN_PASSWORD || "Demo@12345";
const DEMO_ADMIN_NAME = process.env.DEMO_ADMIN_NAME || "Demo Admin";

export const getDemoClientCredentials = () => ({
    email: DEMO_CLIENT_EMAIL,
    password: DEMO_CLIENT_PASSWORD,
    name: DEMO_CLIENT_NAME,
});

export const getDemoExpertCredentials = () => ({
    email: DEMO_EXPERT_EMAIL,
    password: DEMO_EXPERT_PASSWORD,
    name: DEMO_EXPERT_NAME,
});

export const getDemoAdminCredentials = () => ({
    email: DEMO_ADMIN_EMAIL,
    password: DEMO_ADMIN_PASSWORD,
    name: DEMO_ADMIN_NAME,
});

export const seedDemoClient = async () => {
    const credentials = getDemoClientCredentials();

    const existingUser = await prisma.user.findUnique({
        where: {
            email: credentials.email,
        },
        select: {
            id: true,
        },
    });

    let userId = existingUser?.id;

    if (!userId) {
        const created = await auth.api.signUpEmail({
            body: {
                email: credentials.email,
                password: credentials.password,
                name: credentials.name,
                role: Role.CLIENT,
                rememberMe: false,
            },
        });

        userId = created.user.id;
    }

    await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            name: credentials.name,
            role: Role.CLIENT,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            needPasswordChange: false,
            isDeleted: false,
            deletedAt: null,
        },
    });

    await prisma.client.upsert({
        where: {
            userId,
        },
        create: {
            userId,
            fullName: credentials.name,
            email: credentials.email,
            isDeleted: false,
        },
        update: {
            fullName: credentials.name,
            email: credentials.email,
            isDeleted: false,
            deletedAt: null,
        },
    });

    // If you ever add Account creation here, use:
    // const bcrypt = await import('bcrypt');
    // const hashedPassword = await bcrypt.hash(credentials.password, 10);
    // providerId: 'credential', password: hashedPassword
    return credentials;
};


export const seedAdmin = async()=>{
    try{
    const isAdminExists = await prisma.user.findFirst({
        where:{
            role:Role.ADMIN
        }
    })
    if(isAdminExists){
        console.log("Admin seed skipped: admin already exists");
        return;
    }


    const adminUser = await auth.api.signUpEmail({
        body:{
            email:envVars.ADMIN_EMAIL,
            password:envVars.ADMIN_PASSWORD,
            name:"Admin Saheb",
            role:Role.ADMIN,
            rememberMe:false
        }
    })



 await prisma.$transaction(async(tx)=>{
        await tx.user.update({
            where:{
                id:adminUser.user.id
            },
            data:{
                emailVerified:true
            }
        })



        await tx.admin.create({
            data:{
                userId:adminUser.user.id,
                name:' Admin Saheb',
                email:envVars.ADMIN_EMAIL,
               
            }
        })



    })

    const admin = await prisma.admin.findFirst({
        where:{
            email:envVars.ADMIN_EMAIL
        },
        include:{
            user:true
        }
    })
  console.log(' admin created', admin);
    }

    catch(error:any){
     console.error("Error sending  admin", error)
   
     await prisma.user.delete({
        where:{
            email:envVars.ADMIN_EMAIL
        }
     })

    }
}

// ---------------------------------------------------------------------------
// Demo Expert
// ---------------------------------------------------------------------------
export const seedDemoExpert = async () => {
    const credentials = getDemoExpertCredentials();

    // Ensure at least one industry exists so the demo expert can be linked.
    let industry = await prisma.industry.findFirst({
        where: { isDeleted: false },
        select: { id: true },
    });

    if (!industry) {
        industry = await prisma.industry.create({
            data: {
                name: "General Consulting",
                description: "General consulting and advisory services.",
            },
            select: { id: true },
        });
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: credentials.email },
        select: { id: true },
    });

    let userId = existingUser?.id;

    if (!userId) {
        const created = await auth.api.signUpEmail({
            body: {
                email: credentials.email,
                password: credentials.password,
                name: credentials.name,
                role: Role.EXPERT,
                rememberMe: false,
            },
        });

        userId = created.user.id;
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            name: credentials.name,
            role: Role.EXPERT,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            needPasswordChange: false,
            isDeleted: false,
            deletedAt: null,
        },
    });

    await prisma.expert.upsert({
        where: { userId },
        create: {
            userId,
            fullName: credentials.name,
            email: credentials.email,
            title: "Senior Strategy Consultant",
            bio: "Demo expert profile used for product walkthroughs.",
            experience: 8,
            consultationFee: 120,
            isVerified: true,
            industryId: industry.id,
            isDeleted: false,
        },
        update: {
            fullName: credentials.name,
            email: credentials.email,
            isVerified: true,
            isDeleted: false,
            deletedAt: null,
        },
    });

    // If you ever add Account creation here, use:
    // const bcrypt = await import('bcrypt');
    // const hashedPassword = await bcrypt.hash(credentials.password, 10);
    // providerId: 'credential', password: hashedPassword
    return credentials;
};

// ---------------------------------------------------------------------------
// Demo Admin
// ---------------------------------------------------------------------------
export const seedDemoAdmin = async () => {
    const credentials = getDemoAdminCredentials();

    const existingUser = await prisma.user.findUnique({
        where: { email: credentials.email },
        select: { id: true },
    });

    let userId = existingUser?.id;

    if (!userId) {
        const created = await auth.api.signUpEmail({
            body: {
                email: credentials.email,
                password: credentials.password,
                name: credentials.name,
                role: Role.ADMIN,
                rememberMe: false,
            },
        });
        userId = created.user.id;
    }

    await prisma.user.update({
        where: { id: userId },
        data: {
            name: credentials.name,
            role: Role.ADMIN,
            status: UserStatus.ACTIVE,
            emailVerified: true,
            needPasswordChange: false,
            isDeleted: false,
            deletedAt: null,
        },
    });

    await prisma.admin.upsert({
        where: { userId },
        create: {
            userId,
            name: credentials.name,
            email: credentials.email,
        },
        update: {
            name: credentials.name,
            email: credentials.email,
        },
    });

    // No manual account creation or password hash update. Let BetterAuth handle all password logic.
    return credentials;
};