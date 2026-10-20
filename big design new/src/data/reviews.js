// Видео-отзывы учеников. Перенесены из старого компонента src/components/mainPageComponents/Review.vue
// (старый файл не тронут). Из двух версий ролика берём ту, что крупнее.
// posterWeb — облегчённый jpg вместо png по полмегабайта, генерируется командой `npm run previews`.

const IMG = "/gallery_of_works_review/gallery_of_works_review_img";

export const reviews = [
  { slug: "olga",    name: "Ольга",   video: "/gallery_of_works_review/01).mp4", poster: `${IMG}/olga.png` },
  { slug: "natalia", name: "Наталия", video: "/gallery_of_works_review/02).mp4", poster: `${IMG}/Наталья.png` },
  { slug: "sultan",  name: "Султан",  video: "/gallery_of_works_review/03).mp4", poster: `${IMG}/Султан.png` },
  { slug: "boris",   name: "Борис",   video: "/gallery_of_works_review/04).mp4", poster: `${IMG}/Борис.png` },
  { slug: "denis",   name: "Денис",   video: "/gallery_of_works_review/06.mp4",  poster: `${IMG}/Денис.png` },
  { slug: "vitaly",  name: "Виталий", video: "/gallery_of_works_review/07).mp4", poster: `${IMG}/Виталий.png` },
];

reviews.forEach((r) => {
  r.posterWeb = `/gallery_of_works_review/web/${r.slug}.jpg`;
});

export default reviews;
