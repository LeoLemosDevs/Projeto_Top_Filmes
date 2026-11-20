const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
env.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) process.env[k] = v.join('=');
});
const { createClient } = require('@libsql/client/web');
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

async function seed() {
  console.log('Seeding Sagas, Séries e Animes...');

  // 1. Sagas & Coleções
  const existingCol = await db.execute('SELECT COUNT(*) as count FROM collections');
  if (existingCol.rows[0].count === 0) {
    console.log('Criando Sagas e Coleções iniciais...');

    // Buscar alguns filmes de ação/artes marciais para vincular
    const movies = await db.execute('SELECT id, title FROM movies LIMIT 20');

    // Saga 1: Saga Alien & Ficção
    const col1Id = 'col_saga_alien';
    await db.execute({
      sql: `
        INSERT INTO collections (id, title, slug, synopsis, cover_image_url, backdrop_url, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `,
      args: [
        col1Id,
        'Saga Alien: O Oitavo Passageiro',
        'saga-alien',
        'Todos os filmes da aclamada franquia Alien, desde a obra-prima de Ridley Scott até as batalhas mais aterrorizantes no espaço profundo.',
        'https://image.tmdb.org/t/p/w500/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg',
        'https://image.tmdb.org/t/p/original/AmR3JG1DYz5umgKwFiRHM5KVsKx.jpg',
      ],
    });

    // Saga 2: Coleção Rambo
    const col2Id = 'col_colecao_rambo';
    await db.execute({
      sql: `
        INSERT INTO collections (id, title, slug, synopsis, cover_image_url, backdrop_url, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `,
      args: [
        col2Id,
        'Coleção Rambo',
        'colecao-rambo',
        'A jornada completa de John Rambo, o veterano do Vietnã que se tornou um dos maiores ícones do cinema de ação mundial estrelado por Sylvester Stallone.',
        'https://image.tmdb.org/t/p/w500/a9saOlAEf6YTPm7rE1aX42zY51N.jpg',
        'https://image.tmdb.org/t/p/original/mX3shQEegvYn6CRm0b79wR925h6.jpg',
      ],
    });

    // Saga 3: Saga Star Wars
    const col3Id = 'col_saga_star_wars';
    await db.execute({
      sql: `
        INSERT INTO collections (id, title, slug, synopsis, cover_image_url, backdrop_url, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, 1)
      `,
      args: [
        col3Id,
        'Saga Star Wars: Guerra nas Estrelas',
        'saga-star-wars',
        'A épica saga galáctica que revolucionou o cinema. Acompanhe a jornada dos Cavaleiros Jedi, o lado sombrio da Força e a luta pela liberdade na galáxia.',
        'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg',
        'https://image.tmdb.org/t/p/original/zqkmTXzjkAgPTEmq99afL0qRvTG.jpg',
      ],
    });

    // Vincular filmes disponíveis às coleções
    if (movies.rows.length >= 3) {
      for (let i = 0; i < Math.min(movies.rows.length, 5); i++) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO collection_movies (collection_id, movie_id, order_index) VALUES (?, ?, ?)`,
          args: [col1Id, movies.rows[i].id, i + 1],
        });
      }
      for (let i = 2; i < Math.min(movies.rows.length, 7); i++) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO collection_movies (collection_id, movie_id, order_index) VALUES (?, ?, ?)`,
          args: [col2Id, movies.rows[i].id, i - 1],
        });
      }
      for (let i = 5; i < Math.min(movies.rows.length, 10); i++) {
        await db.execute({
          sql: `INSERT OR IGNORE INTO collection_movies (collection_id, movie_id, order_index) VALUES (?, ?, ?)`,
          args: [col3Id, movies.rows[i].id, i - 4],
        });
      }
    }
  }

  // 2. Séries
  const existingSeries = await db.execute("SELECT COUNT(*) as count FROM series WHERE content_type = 'SERIES'");
  if (existingSeries.rows[0].count === 0) {
    console.log('Criando Séries iniciais com temporadas e episódios...');
    const s1Id = 'ser_stranger_things';
    await db.execute({
      sql: `
        INSERT INTO series (
          id, title, slug, synopsis, genre, content_type,
          cover_image_url, backdrop_url, release_year, status, is_featured, hashtags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        s1Id,
        'Stranger Things',
        'stranger-things',
        'Quando um garoto desaparece em uma pequena cidade do interior, seus amigos, sua família e a polícia local acabam descobrindo um mistério extraordinário envolvendo experimentos secretos do governo, forças sobrenaturais aterrorizantes e uma garotinha muito estranha.',
        'Ficção Científica',
        'SERIES',
        'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
        'https://image.tmdb.org/t/p/original/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
        2016,
        'FINALIZADA',
        1,
        '#StrangerThings #Series #Ficcao #Terror',
      ],
    });

    const sea1Id = 'sea_st_1';
    await db.execute({
      sql: `INSERT INTO seasons (id, series_id, season_number, title, synopsis) VALUES (?, ?, 1, 'Temporada 1', 'O desaparecimento de Will Byers e a aparição da Eleven.')`,
      args: [sea1Id, s1Id],
    });

    const sea2Id = 'sea_st_2';
    await db.execute({
      sql: `INSERT INTO seasons (id, series_id, season_number, title, synopsis) VALUES (?, ?, 2, 'Temporada 2', 'A volta de Will e a ameaça do Devorador de Mentes.')`,
      args: [sea2Id, s1Id],
    });

    // Episódios T1
    const stEpisodes = [
      { num: 1, title: 'Capítulo Um: O Desaparecimento de Will Byers', dur: 48, url: 'https://www.youtube.com/watch?v=b9EkMc79ZSU', syn: 'No caminho de volta para casa da casa de um amigo, o jovem Will vê algo aterrorizante. Perto dali, um segredo sinistro espreita nas profundezas de um laboratório.' },
      { num: 2, title: 'Capítulo Dois: A Estranha da Maple Street', dur: 55, url: 'https://www.youtube.com/watch?v=R1ZXOOLMJ8w', syn: 'Lucas, Mike e Dustin tentam conversar com a garota que encontraram na floresta. Hopper questiona Joyce sobre uma misteriosa ligação telefônica.' },
      { num: 3, title: 'Capítulo Três: Caramelo', dur: 51, url: 'https://www.youtube.com/watch?v=vgS2L7WPIO4', syn: 'Uma Joyce cada vez mais desesperada tenta se comunicar com Will. Eleven tem um flashback de Hawkins Lab. Nancy investiga o desaparecimento de Barbara.' },
      { num: 4, title: 'Capítulo Quatro: O Corpo', dur: 50, url: 'https://www.youtube.com/watch?v=b9EkMc79ZSU', syn: 'Recusando-se a acreditar que Will está morto, Joyce tenta se conectar com seu filho. Os meninos dão a Eleven uma transformação.' }
    ];

    for (const ep of stEpisodes) {
      await db.execute({
        sql: `
          INSERT INTO episodes (
            id, season_id, series_id, episode_number, title,
            synopsis, duration_minutes, thumbnail_url, video_url, video_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'youtube')
        `,
        args: [
          `ep_st_1_${ep.num}`,
          sea1Id,
          s1Id,
          ep.num,
          ep.title,
          ep.syn,
          ep.dur,
          'https://image.tmdb.org/t/p/w500/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
          ep.url,
        ],
      });
    }
  }

  // 3. Animes
  const existingAnime = await db.execute("SELECT COUNT(*) as count FROM series WHERE content_type = 'ANIME'");
  if (existingAnime.rows[0].count === 0) {
    console.log('Criando Animes iniciais com temporadas e episódios...');
    const a1Id = 'ser_naruto_shippuden';
    await db.execute({
      sql: `
        INSERT INTO series (
          id, title, slug, synopsis, genre, content_type,
          cover_image_url, backdrop_url, release_year, status, is_featured, hashtags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        a1Id,
        'Naruto Shippuden',
        'naruto-shippuden',
        'Dois anos e meio após o término de seu treinamento com Jiraiya, Naruto Uzumaki retorna à Vila da Folha pronto para resgatar seu amigo Sasuke Uchiha e enfrentar a perigosa organização Akatsuki.',
        'Anime',
        'ANIME',
        'https://image.tmdb.org/t/p/w500/xU09499SyIlUtjfnxQI47vURMEq.jpg',
        'https://image.tmdb.org/t/p/original/v5C13vWspkE514v3Pfv38W3kQG7.jpg',
        2007,
        'FINALIZADA',
        1,
        '#Naruto #NarutoShippuden #Anime #Ninja',
      ],
    });

    const aSea1 = 'sea_naruto_1';
    await db.execute({
      sql: `INSERT INTO seasons (id, series_id, season_number, title, synopsis) VALUES (?, ?, 1, 'Temporada 1: Resgate do Kazekage', 'Naruto retorna à Vila da Folha e parte na missão urgente de resgate do Kazekage Gaara.')`,
      args: [aSea1, a1Id],
    });

    const narutoEpisodes = [
      { num: 1, title: 'Episódio 1: Volta Para Casa', dur: 24, url: 'https://www.youtube.com/watch?v=1d3Z4e8iPvg', syn: 'Naruto e Jiraiya retornam à Vila da Folha após dois anos e meio de intenso treinamento. Naruto reencontra Sakura e Kakashi.' },
      { num: 2, title: 'Episódio 2: A Akatsuki se Move', dur: 24, url: 'https://www.youtube.com/watch?v=1d3Z4e8iPvg', syn: 'Deidara e Sasori da temível Akatsuki se infiltram na Vila da Areia com o objetivo de capturar o Kazekage Gaara.' },
      { num: 3, title: 'Episódio 3: O Resultado do Treinamento', dur: 24, url: 'https://www.youtube.com/watch?v=1d3Z4e8iPvg', syn: 'Kakashi testa as novas habilidades de Naruto e Sakura no clássico teste dos sinos em Konoha.' },
      { num: 4, title: 'Episódio 4: O Jinchuuriki da Areia', dur: 24, url: 'https://www.youtube.com/watch?v=1d3Z4e8iPvg', syn: 'Gaara trava uma batalha titânica nos céus da Vila da Areia contra o artista explosivo Deidara.' }
    ];

    for (const ep of narutoEpisodes) {
      await db.execute({
        sql: `
          INSERT INTO episodes (
            id, season_id, series_id, episode_number, title,
            synopsis, duration_minutes, thumbnail_url, video_url, video_type
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'youtube')
        `,
        args: [
          `ep_naruto_1_${ep.num}`,
          aSea1,
          a1Id,
          ep.num,
          ep.title,
          ep.syn,
          ep.dur,
          'https://image.tmdb.org/t/p/w500/v5C13vWspkE514v3Pfv38W3kQG7.jpg',
          ep.url,
        ],
      });
    }
  }

  console.log('Seed de Sagas, Séries e Animes finalizado com sucesso!');
}

seed().catch(console.error);
