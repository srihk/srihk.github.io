class Figure {
    static Type = Object.freeze({
        IMG: "img",
        VIDEO: "video"
    });

    constructor(type, src, caption) {
        this.type = type;
        this.src = src;
        this.caption = caption;
    }

    toString() {
        return `type: ${this.type}, src: ${this.src}, caption: ${this.caption}`;
    }
}

function createGallery(elementId, assetPath) {
    const request = new Request(assetPath + "assets.json");
    fetch(request)
        .then((response) => response.json())
        .then((asset) => {
            const figures = [];
            asset.forEach(asset => {
                figures.push(new Figure(asset.type, assetPath + asset.src, asset.caption));
            });

            function createFigure(figures, state) {
                const media = document.createElement(figures[state].type);
                media.setAttribute("src", figures[state].src);
                media.setAttribute("id", `${elementId}.${figures[state].type}`);
                if (figures[state].type == Figure.Type.VIDEO) {
                    media.setAttribute("controls", "");
                    const videoP = document.createElement("p");
                    videoP.innerHTML = `Your browser doesn't support HTML5 video. Here is a <a href="${figures[state].src}">link to the video</a> instead.`
                    media.appendChild(videoP);
                }

                const caption = document.createElement("figcaption");
                caption.innerHTML = figures[state].caption;
                caption.setAttribute("id", `${elementId}.caption`);
                
                const figure = document.createElement("figure");
                figure.setAttribute("id", `${elementId}.figure`);
                figure.appendChild(media);
                figure.appendChild(caption);

                return figure;
            }
            
            const thumbs = document.createElement("div");
            thumbs.setAttribute("class", "thumbs");
            const gallery = document.getElementById(elementId);
            figures.forEach((fig, index) => {
                const thumbWidth = 100 / figures.length;
                const media = document.createElement(fig.type);
                media.setAttribute("src", fig.src);
                media.setAttribute("id", `${elementId}.${fig.src}`);
                media.setAttribute("index", index);
                media.setAttribute("class", "thumb");
                media.setAttribute("width", `${thumbWidth}%`);
                thumbs.appendChild(media);
            });
            thumbs.addEventListener(
                "click",
                (event) => {
                    if (event.target === event.currentTarget) {
                        return;
                    }
                    const state = event.target.getAttribute("index");
                    document.getElementById(`${elementId}.figure`).remove();
                    gallery.insertBefore(createFigure(figures, state), gallery.firstChild);
                }
            );

            gallery.appendChild(createFigure(figures, 0));
            gallery.appendChild(thumbs);
        });
}

createGallery("gallery-gsoc", "assets/gsoc2020-blender/")
