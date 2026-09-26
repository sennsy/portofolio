const INSTAGRAM_URL =
"https://instagram.com/immszkyy";

const WHATSAPP_URL =
"https://wa.me/628138964075?text=Halo%20kak,%20saya%20ingin%20order%20desain%20nih.";

const DISCORD_URL =
"https://discord.gg/84DdJzUvvy";

document.getElementById(
"btn-instagram"
).href = INSTAGRAM_URL;

document.getElementById(
"btn-whatsapp"
).href = WHATSAPP_URL;

document.getElementById(
"btn-discord"
).href = DISCORD_URL;

/* Testimonials */
const testimonialTrack =
document.getElementById(
"testimonialTrack"
);

const testimonials = [
{ name: "eight.explorer", avatar: "eighte.png", rating: 5, msg: "Desainnya keren banget, revisinya cepat." },
{ name: "qil.frfr", avatar: "aqill.png", rating: 5, msg: "HOOLLYY SHII, thanks so much twin. berguna banget buat bazar nanti" },
{ name: "Rafa Rizqi", avatar: "rafajago.jpg", rating: 5, msg: "responnya cepat, hasilnya sangat memuaskan. ga nyesel sih pilih design disini" },
{ name: "Ghina", avatar: "ghina.jpg", rating: 4, msg: "baguss hasilnyaa, pelayanannya juga ramah" },
{ name: "Clementdav", avatar: "clementdav.jpg", rating: 5, msg: "Thank uuu woii, actually kerenn bgt" },
{ name: "cornercrocs", avatar: "corner.jpg", rating: 5, msg: "Wow, bagus sekali. saya puas dengan hasil ini, terimakasih kak!" },
{ name: "Molfordan", avatar: "scioss.png", rating: 5, msg: "Kelasss kinkk. keren parah gilaa" },
{ name: "Nazifah", avatar: "nazifah.png", rating: 5, msg: "okay, thank u so much yaa. u sgt berjasa today" },
{ name: "Lava Hosting", avatar: "lava.jpeg", rating: 5, msg: "Sip, bagus hasilnya. terimakasih banyak ya kak" },
{ name: "Chandra Hartono", avatar: "chandra.png", rating: 5, msg: "Design website nya bagus dan clean, semoga bisa improve buat figma biar lebih gampang" }

];

function buildTestimonialCard(item) {

return `
<div class="testimonial-item">
<img
src="./assets/${item.avatar}"
alt="${item.name}"
class="testimonial-avatar"
loading="lazy"
> <div class="testimonial-body">
<p class="testimonial-name">${item.name}</p>
<p class="testimonial-rating">${"★".repeat(item.rating)}</p>
<p class="testimonial-msg">"${item.msg}"</p>
</div>
</div>
`;
}

if (testimonialTrack) {

const cardsHTML =
testimonials
.map(buildTestimonialCard)
.join("");

/* Digandakan agar loop scroll terlihat seamless (infinite) */
testimonialTrack.innerHTML =
cardsHTML + cardsHTML;
}

const orderText =
document.getElementById(
"orderText"
);

const fonts = [
"Poppins",
"Bebas Neue",
"Playfair Display",
"Caveat",
"Pacifico",
"Orbitron",
"Space Grotesk",
"Anton",
"Dancing Script",
"Abril Fatface",
"Courier Prime",
"Permanent Marker"
];

setInterval(() => {

const randomFont =
fonts[
Math.floor(
Math.random() *
fonts.length
)
];

orderText.style.fontFamily =
randomFont;

}, 150);

const container = document.getElementById("particles");

const amount = 70;

for(let i = 0; i < amount; i++){

const p = document.createElement("span");

p.classList.add("particle");

const size = Math.random() * 4 + 1;

p.style.width = size + "px";
p.style.height = size + "px";

p.style.left = Math.random() * 100 + "%";
p.style.bottom = -(Math.random() * 100) + "px";

p.style.opacity = Math.random();

p.style.animationDuration =
(12 + Math.random() * 15) + "s";

p.style.animationDelay =
-(Math.random() * 25) + "s";

p.style.setProperty(
"--drift",
(Math.random() * 120 - 60) + "px"
);

container.appendChild(p);

}


