const { pool } = require('./src/database/connection.js');

async function checkTables() {
  try {
    const connection = await pool.getConnection();

    console.log('\n📊 Available Tables:');
    const [tables] = await connection.execute('SHOW TABLES');
    tables.forEach((table) => {
      console.log(`  ✅ ${Object.values(table)[0]}`);
    });

    console.log('\n👤 Users Table Structure:');
    const [userCols] = await connection.execute('DESCRIBE users');
    userCols.forEach((col) => {
      console.log(
        `  - ${col.Field} (${col.Type}) ${
          col.Null === 'NO' ? 'NOT NULL' : 'NULL'
        }`
      );
    });

    console.log('\n🎬 Movies Table Structure:');
    const [movieCols] = await connection.execute('DESCRIBE movies');
    movieCols.forEach((col) => {
      console.log(
        `  - ${col.Field} (${col.Type}) ${
          col.Null === 'NO' ? 'NOT NULL' : 'NULL'
        }`
      );
    });

    console.log('\n⭐ Reviews Table Structure:');
    const [reviewCols] = await connection.execute('DESCRIBE reviews');
    reviewCols.forEach((col) => {
      console.log(
        `  - ${col.Field} (${col.Type}) ${
          col.Null === 'NO' ? 'NOT NULL' : 'NULL'
        }`
      );
    });

    connection.release();
    console.log('\n✅ Database verification complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  process.exit(0);
}

checkTables();
