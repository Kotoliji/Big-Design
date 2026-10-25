// Список работ учеников.
// Скопирован из старого компонента src/components/mainPageComponents/Gallery_of_works.vue
// (старый файл не тронут — там данные остались как были).
//
// orientation — подсказка для верстки: "v" вертикальное видео, "h" горизонтальное.

export const works = [
  { slug: "olga",     name: "Ольга Овсейчик",   orientation: "v", video: "/gallery_of_works_video/01.mp4",            poster: "/gallery_of_works_video/gallery_of_work_screen/01.png" },
  { slug: "natalia",  name: "Наталия",          orientation: "v", video: "/gallery_of_works_video/02.mp4",            poster: "/gallery_of_works_video/gallery_of_work_screen/02.png" },
  { slug: "sultan",   name: "Султан",           orientation: "v", video: "/gallery_of_works_video/03.mp4",            poster: "/gallery_of_works_video/gallery_of_work_screen/03.png" },
  { slug: "boris",    name: "Борис",            orientation: "v", video: "/gallery_of_works_video/04.mp4",            poster: "/gallery_of_works_video/gallery_of_work_screen/04.png" },
  { slug: "vasilisa", name: "Василиса",         orientation: "v", video: "/gallery_of_works_video/05.mp4",            poster: "/gallery_of_works_video/gallery_of_work_screen/05.png" },
  { slug: "denis",    name: "Денис Мещеряков",  orientation: "v", video: "/gallery_of_works_video/06.mp4",            poster: "/gallery_of_works_video/gallery_of_work_screen/06.png" },
  { slug: "vitaly",   name: "Виталий Иванец",   orientation: "v", video: "/gallery_of_works_video/07.mp4",            poster: "/gallery_of_works_video/gallery_of_work_screen/07.png" },
  { slug: "vasiliy",  name: "Василий",          orientation: "v", video: "/gallery_of_works_video/08.mp4",            poster: "/gallery_of_works_video/gallery_of_work_screen/08.png" },
  { slug: "vlad",     name: "Влад",             orientation: "v", video: "/gallery_of_works_video/Final Render2.mp4", poster: "/gallery_of_works_video/gallery_of_work_screen/09.png" },
  { slug: "work-15",  name: "",                 orientation: "h", video: "/gallery_of_works_video/015.mp4",           poster: "" },
  { slug: "nikita",   name: "Никита",           orientation: "h", video: "/gallery_of_works_video/010.mp4",           poster: "/gallery_of_works_video/gallery_of_work_screen/11.png" },
  { slug: "boris2",   name: "Борис",            orientation: "h", video: "/gallery_of_works_video/011.mp4",           poster: "/gallery_of_works_video/gallery_of_work_screen/12.png" },
  { slug: "lera",     name: "Лера",             orientation: "h", video: "/gallery_of_works_video/012.MOV",           poster: "/gallery_of_works_video/gallery_of_work_screen/13.png" },
  { slug: "work-13",  name: "",                 orientation: "h", video: "/gallery_of_works_video/013.mp4",           poster: "" },
  { slug: "work-14",  name: "",                 orientation: "h", video: "/gallery_of_works_video/014.mp4",           poster: "" },
  // Последняя карта колоды — на ней колода "садится" перед заставкой.
  { slug: "saveliy",  name: "Савелий",          orientation: "h", video: "/gallery_of_works_video/09.mp4",            poster: "/gallery_of_works_video/gallery_of_work_screen/010.png" },
];

// Лёгкие версии — генерируются командой `npm run previews` (scripts/make-previews.mjs):
// превью для колоды и карточек галереи (400px, 4 сек, без звука) и веб-копия для просмотра
// работы целиком (до 1920px, со звуком). Оригиналы (video / poster) остаются как были.
works.forEach((w) => {
  w.previewVideo = `/gallery_of_works_video/preview/${w.slug}.mp4`;
  w.previewPoster = `/gallery_of_works_video/preview/${w.slug}.jpg`;
  w.webVideo = `/gallery_of_works_video/web/${w.slug}.mp4`;
});

export default works;
