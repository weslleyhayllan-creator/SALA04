// API Configuration
const JOKE_API_URL = 'https://official-joke-api.appspot.com/jokes';

// DOM Elements
const getJokeBtn = document.getElementById('getJokeBtn');
const copyBtn = document.getElementById('copyBtn');
const jokeText = document.getElementById('jokeText');
const jokeType = document.getElementById('jokeType');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const jokeCount = document.getElementById('jokeCount');

// State
let jokesLoaded = 0;
let currentJoke = '';

// Event Listeners
getJokeBtn.addEventListener('click', fetchJoke);
copyBtn.addEventListener('click', copyToClipboard);
jokeType.addEventListener('change', fetchJoke);

// Fetch Joke from API
async function fetchJoke() {
    try {
        // Show loading state
        loading.classList.add('active');
        errorMessage.classList.remove('active');
        getJokeBtn.disabled = true;
        copyBtn.disabled = true;

        // Build API URL based on selected type
        let url = JOKE_API_URL;
        const selectedType = jokeType.value;

        if (selectedType !== 'any') {
            url += `/${selectedType}/random`;
        } else {
            url += '/random';
        }

        // Fetch joke from API
        const response = await fetch(url);

        // Check if response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Handle array response (some endpoints return arrays)
        const jokeData = Array.isArray(data) ? data[0] : data;

        // Format joke text
        if (jokeData.setup && jokeData.punchline) {
            currentJoke = `${jokeData.setup}\n\n${jokeData.punchline}`;
        } else if (jokeData.joke) {
            currentJoke = jokeData.joke;
        } else {
            throw new Error('Unable to parse joke data');
        }

        // Display joke
        jokeText.textContent = currentJoke;
        jokesLoaded++;
        jokeCount.textContent = jokesLoaded;

        // Animate joke text
        jokeText.style.animation = 'none';
        setTimeout(() => {
            jokeText.style.animation = 'fadeIn 0.5s ease-in';
        }, 10);

    } catch (error) {
        // Display error message
        console.error('Error fetching joke:', error);
        showError(`Oops! Failed to load joke: ${error.message}`);
        currentJoke = '';
    } finally {
        // Hide loading state
        loading.classList.remove('active');
        getJokeBtn.disabled = false;
        copyBtn.disabled = false;
    }
}

// Copy Joke to Clipboard
async function copyToClipboard() {
    if (!currentJoke) {
        showError('No joke to copy!');
        return;
    }

    try {
        // Copy to clipboard
        await navigator.clipboard.writeText(currentJoke);
        showSuccess('Joke copied to clipboard!');
    } catch (error) {
        console.error('Failed to copy:', error);
        showError('Failed to copy joke to clipboard');
    }
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorMessage.classList.remove('active');
    }, 5000);
}

// Show Success Message
function showSuccess(message) {
    // Create success message if it doesn't exist
    let successMsg = document.getElementById('successMessage');
    if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.id = 'successMessage';
        successMsg.className = 'success-message';
        jokeText.parentElement.appendChild(successMsg);
    }

    successMsg.textContent = message;
    successMsg.classList.add('active');

    // Auto-hide after 3 seconds
    setTimeout(() => {
        successMsg.classList.remove('active');
    }, 3000);
}

// Alternative API Functions (for fallback)
async function fetchJokeFromJokeAPI() {
    const url = 'https://v2.jokeapi.dev/joke/Any';
    const response = await fetch(url);
    const data = await response.json();

    if (data.type === 'twopart') {
        return `${data.setup}\n\n${data.delivery}`;
    } else {
        return data.joke;
    }
}

// Initialize - Load first joke on page load
window.addEventListener('load', () => {
    console.log('Joke Generator loaded! Ready to fetch jokes.');
});

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        if (!getJokeBtn.disabled) {
            fetchJoke();
        }
    }
});

// Add touch feedback for mobile
if (window.matchMedia('(hover: none)').matches) {
    getJokeBtn.addEventListener('touchstart', function() {
        this.style.opacity = '0.8';
    });

    getJokeBtn.addEventListener('touchend', function() {
        this.style.opacity = '1';
    });
}

// Console message
console.log('🎭 Joke Generator Ready!');
console.log('Using Official Joke API: https://official-joke-api.appspot.com/');
