const apiUrls = [
    { url: 'https://archive.org/metadata/ios_3_ipa', version: 'iOS 3.x' },
    { url: 'https://archive.org/metadata/ios_2_ipa', version: 'iOS 2.x' },
    { url: 'https://archive.org/metadata/ios_2_ipa_p2', version: 'iOS 2.x' }
];

const gamesContainer = document.getElementById('games-container');
const loadingIndicator = document.getElementById('loading');
const searchBar = document.getElementById('search-bar');

let allGamesList = []; 
let filteredGamesList = []; 
let currentIndex = 0; 
const itemsPerPage = 15;

function formatFileSize(bytes) {
    bytes = parseInt(bytes, 10);

    if (bytes >= 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    } else if (bytes >= 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return bytes + ' B';
    }
}

async function fetchGames() {
    try {
        let allGames = [];
        
        for (const api of apiUrls) {
            const response = await fetch(api.url);
            const data = await response.json();
            
            if (data && data.files) {
                const ipaFiles = data.files
                    .filter(file => file.name.endsWith('.ipa'))
                    .map(file => ({ ...file, version: api.version })); 
                allGames = allGames.concat(ipaFiles);
            }
        }
        
        if (allGames.length > 0) {
            allGamesList = allGames;
            filteredGamesList = [...allGamesList]; 
            loadingIndicator.style.display = 'none';
            renderGames(); 
        } else {
            loadingIndicator.textContent = 'No games found.';
        }
    } catch (error) {
        console.error('Error fetching games:', error);
        loadingIndicator.textContent = 'An error occurred. Please try again later.';
    }
}

function renderGames() {
    const endIndex = currentIndex + itemsPerPage; 
    const gamesToRender = filteredGamesList.slice(currentIndex, endIndex); 

    gamesToRender.forEach(file => {
        const card = createGameCard(file);
        gamesContainer.appendChild(card);
    });

    currentIndex = endIndex; 

    const loadMoreButton = document.getElementById('load-more');
    if (currentIndex >= filteredGamesList.length) {
        if (loadMoreButton) {
            loadMoreButton.style.display = 'none';
        }
    } else if (!loadMoreButton) {
        createLoadMoreButton(); 
    }
}

function createGameCard(file) {
    const card = document.createElement('div');
    card.className = 'card';

    const basePath =
        file.version === 'iOS 3.x'
            ? 'ios_3_ipa'
            : file.version === 'iOS 2.x'
            ? (file.name.includes('p2') ? 'ios_2_ipa_p2' : 'ios_2_ipa')
            : '';

    const imageUrl = `https://archive.org/download/${basePath}/${file.name}/iTunesArtwork`;

    const image = document.createElement('img');
    image.src = imageUrl;
    image.alt = file.name;
    image.onerror = () => {
        image.src = 'https://via.placeholder.com/150?text=No+Image';
    };

    const content = document.createElement('div');
    content.className = 'card-content';

    const title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = file.name;

    const version = document.createElement('p');
    version.textContent = `Version: ${file.version}`;
    version.style.fontSize = '0.9rem';
    version.style.color = '#777';

    const size = document.createElement('p');
    size.textContent = file.size
        ? `Size: ${formatFileSize(file.size)}`
        : 'Size: Unknown';
    size.style.fontSize = '0.9rem';
    size.style.color = '#777';

    const downloadLink = document.createElement('a');
    const fileUrl = `https://archive.org/download/${basePath}/${file.name}`;
    
    downloadLink.href = fileUrl;
    downloadLink.textContent = 'Download';
    downloadLink.style.padding = '0.5rem 1rem';
    downloadLink.style.fontSize = '1rem';
    downloadLink.style.border = 'none';
    downloadLink.style.borderRadius = '4px';
    downloadLink.style.backgroundColor = '#6200ee';
    downloadLink.style.color = '#fff';
    downloadLink.style.cursor = 'pointer';

    content.appendChild(title);
    content.appendChild(version);
    content.appendChild(size); 
    content.appendChild(downloadLink);

    card.appendChild(image);
    card.appendChild(content);

    return card;
}

function createLoadMoreButton() {
    const loadMoreButton = document.createElement('button');
    loadMoreButton.id = 'load-more';
    loadMoreButton.textContent = 'Load More';
    loadMoreButton.style.margin = '1rem auto';
    loadMoreButton.style.padding = '0.5rem 1rem';
    loadMoreButton.style.fontSize = '1rem';
    loadMoreButton.style.border = 'none';
    loadMoreButton.style.borderRadius = '4px';
    loadMoreButton.style.backgroundColor = '#6200ee';
    loadMoreButton.style.color = '#fff';
    loadMoreButton.style.cursor = 'pointer';

    loadMoreButton.addEventListener('click', renderGames);

    gamesContainer.parentElement.appendChild(loadMoreButton);
}

function filterGames() {
    const query = searchBar.value.toLowerCase(); 
    filteredGamesList = allGamesList.filter(game =>
        game.name.toLowerCase().includes(query)
    ); 

    gamesContainer.innerHTML = '';
    currentIndex = 0; 
    renderGames(); 

    const loadMoreButton = document.getElementById('load-more');
    if (loadMoreButton) {
        loadMoreButton.style.display =
            currentIndex < filteredGamesList.length ? 'block' : 'none';
    }
}

function initialize() {
    fetchGames();
    searchBar.addEventListener('input', filterGames);
}

initialize();
