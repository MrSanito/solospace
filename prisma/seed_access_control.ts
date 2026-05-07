import { PrismaClient, PermissionKey, DataScopeType, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const connectionString = process.env.DATABASE_URL!
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('🌱 Seeding Access Control System...')

  const org = await prisma.organization.findFirst()
  if (!org) {
    console.error('❌ No organization found. Please seed an organization first.')
    process.exit(1)
  }

  const organizationId = org.id
  console.log(`✅ Using Organization: ${org.name} (${organizationId})`)

  const rolesToSeed: {
    name: string;
    description: string;
    icon: string;
    color: string;
    orderIndex: number;
    scope: DataScopeType;
    permissions: PermissionKey[];
  }[] = [
    {
      name: 'CEO',
      description: 'Full access to all organizational data and settings',
      icon: 'shield',
      color: 'text-purple-600',
      orderIndex: 0,
      scope: DataScopeType.ALL,
      permissions: Object.values(PermissionKey)
    },
    {
      name: 'ORG_ADMIN',
      description: 'Administrative access for organization management',
      icon: 'settings',
      color: 'text-blue-600',
      orderIndex: 1,
      scope: DataScopeType.ALL,
      permissions: Object.values(PermissionKey)
    },
    {
      name: 'MANAGER',
      description: 'Team management with visibility into team data',
      icon: 'users',
      color: 'text-green-600',
      orderIndex: 2,
      scope: DataScopeType.TEAM,
      permissions: [
        PermissionKey.VIEW_LEADS,
        PermissionKey.MANAGE_LEADS,
        PermissionKey.CHAT_ACCESS,
        PermissionKey.FILE_VIEW,
        PermissionKey.FILE_UPLOAD,
        PermissionKey.FILE_DOWNLOAD,
        PermissionKey.AUDIT_LOGS
      ]
    },
    {
      name: 'SALES_REP',
      description: 'Individual contributor with access to assigned leads',
      icon: 'user',
      color: 'text-gray-600',
      orderIndex: 3,
      scope: DataScopeType.OWN,
      permissions: [
        PermissionKey.VIEW_LEADS,
        PermissionKey.MANAGE_LEADS,
        PermissionKey.CHAT_ACCESS,
        PermissionKey.FILE_VIEW
      ]
    }
  ]

  for (const roleDef of rolesToSeed) {
    console.log(`Creating/Updating role: ${roleDef.name}...`)
    
    const customRole = await prisma.customRole.upsert({
      where: {
        name_organizationId: {
          name: roleDef.name,
          organizationId
        }
      },
      update: {
        description: roleDef.description,
        icon: roleDef.icon,
        color: roleDef.color,
        orderIndex: roleDef.orderIndex,
        isSystem: true
      },
      create: {
        name: roleDef.name,
        organizationId,
        description: roleDef.description,
        icon: roleDef.icon,
        color: roleDef.color,
        orderIndex: roleDef.orderIndex,
        isSystem: true
      }
    })

    // Seed Permissions
    for (const permKey of Object.values(PermissionKey)) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permission: {
            roleId: customRole.id,
            permission: permKey
          }
        },
        update: {
          allowed: roleDef.permissions.includes(permKey)
        },
        create: {
          roleId: customRole.id,
          permission: permKey,
          allowed: roleDef.permissions.includes(permKey)
        }
      })
    }

    // Seed Data Access Scope
    await prisma.dataAccessScope.upsert({
      where: { roleId: customRole.id },
      update: {
        scopeType: roleDef.scope
      },
      create: {
        roleId: customRole.id,
        scopeType: roleDef.scope
      }
    })
    
    console.log(`✅ Role ${roleDef.name} seeded.`)
  }

  console.log('\n🎉 Access Control Seeding Complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
