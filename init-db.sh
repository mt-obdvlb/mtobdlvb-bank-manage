
## 2️⃣ 初始化 MySQL + Prisma 脚本（`init-db.sh`）

# 脚本作用：创建数据库、生成 Prisma Client、同步表结构
# 使用前请确认 mysql 命令可用，且已安装 mysql 客户端

DB_NAME="bank_db"
DB_USER="root"
DB_PASS="123456"  # 请根据实际修改
DB_HOST="127.0.0.1"
DB_PORT="3306"

echo "==> 创建数据库 $DB_NAME ..."
mysql -u$DB_USER -p$DB_PASS -h $DB_HOST -P $DB_PORT -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "==> 生成 Prisma Client ..."
npx prisma generate

echo "==> 同步数据库表结构 ..."
npx prisma db push

echo "✅ 数据库初始化完成！"