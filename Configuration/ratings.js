(function() {
    'use strict';

    console.log('[UserRatings] Loading plugin...');

    // CSS for inline ratings UI
    const style = document.createElement('style');
    style.textContent = `
        .user-ratings-container {
            background: rgba(0, 0, 0, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 10px;
            padding: 2em 2.5em;
            margin-bottom: 2em;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .user-ratings-header {
            font-size: 1.3em;
            font-weight: 500;
            margin-bottom: 1.2em;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 1em;
            flex-wrap: wrap;
        }
        .user-ratings-average {
            color: #ffd700;
            font-size: 1.1em;
        }
        .user-ratings-my-rating {
            margin-bottom: 1.5em;
            padding-bottom: 1.5em;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }
        .user-ratings-section-title {
            font-size: 1.1em;
            margin-bottom: 0.75em;
            color: #00a4dc;
            font-weight: 500;
        }
        .rating-form-row {
            display: flex;
            gap: 1em;
            align-items: flex-start;
            flex-wrap: wrap;
            margin-top: 1em;
            padding-right: 0.5em;
        }
        .rating-form-col {
            flex: 1;
            min-width: 200px;
        }
        .star-rating {
            display: inline-flex;
            gap: 0.25em;
            cursor: pointer;
            font-size: 1.8em;
            margin-bottom: 0.5em;
        }
        .star-rating .star {
            color: #555;
            transition: color 0.2s, transform 0.1s;
            cursor: pointer;
        }
        .star-rating .star.filled {
            color: #ffd700;
        }
        .star-rating .star:hover {
            color: #ffed4e;
            transform: scale(1.1);
        }
        .rating-note-input {
            width: 100%;
            padding: 0.8em 1em;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 6px;
            color: white;
            font-size: 0.95em;
            font-family: inherit;
            transition: border-color 0.2s, background 0.2s;
            resize: vertical;
            min-height: 80px;
            line-height: 1.5;
        }
        .rating-note-input:focus {
            outline: none;
            border-color: #00a4dc;
            background: rgba(0, 0, 0, 0.3);
        }
        .rating-note-input::placeholder {
            color: rgba(255, 255, 255, 0.4);
        }
        .rating-actions {
            margin-top: 1em;
            display: flex;
            gap: 0.5em;
            flex-wrap: wrap;
        }
        .rating-actions button {
            padding: 0.6em 1.3em;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
            font-size: 0.95em;
            transition: all 0.2s;
        }
        .rating-actions .save-btn {
            background: #00a4dc;
            color: white;
        }
        .rating-actions .save-btn:hover {
            background: #0080b3;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 164, 220, 0.3);
        }
        .rating-actions .save-btn:disabled {
            background: #555;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }
        .rating-actions .delete-btn {
            background: rgba(229, 57, 53, 0.8);
            color: white;
        }
        .rating-actions .delete-btn:hover {
            background: #e53935;
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(229, 57, 53, 0.3);
        }
        .user-ratings-all {
            margin-top: 1.5em;
        }
        .rating-item {
            margin: 0.75em 0;
            padding: 1em;
            background: rgba(0, 0, 0, 0.12);
            border-radius: 8px;
            color: #ffffff;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .rating-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5em;
            flex-wrap: wrap;
            gap: 0.5em;
        }
        .rating-item-user {
            font-weight: 500;
            color: #ffffff;
        }
        .rating-item-stars {
            color: #ffd700;
            margin-left: 0.5em;
        }
        .rating-item-date {
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.5);
        }
        .rating-item-note {
            margin-top: 0.5em;
            opacity: 0.9;
            font-size: 0.95em;
            color: #e0e0e0;
            line-height: 1.4;
        }
    `;
    document.head.appendChild(style);

    let currentItemId = null;
    let currentRating = 0;
    let isInjecting = false; // Flag to prevent concurrent injections

    function createStarRating(rating, interactive, onHover, onClick) {
        const container = document.createElement('div');
        container.className = 'star-rating';
        let currentSelectedRating = rating;
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i <= rating ? ' filled' : '');
            star.textContent = '★';
            star.dataset.rating = i;
            
            if (interactive) {
                star.addEventListener('mouseenter', () => onHover(i));
                star.addEventListener('click', () => {
                    currentSelectedRating = i;
                    onClick(i);
                });
            }
            
            container.appendChild(star);
        }
        
        if (interactive) {
            container.addEventListener('mouseleave', () => onHover(currentSelectedRating));
        }
        
        return container;
    }

    function updateStarDisplay(container, rating) {
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
    }

    async function loadRatings(itemId) {
        try {
            const response = await fetch(ApiClient.getUrl(`api/UserRatings/Item/${itemId}`), {
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            const data = await response.json();
            console.log('[UserRatings] Loaded ratings:', data);
            return data;
        } catch (error) {
            console.error('[UserRatings] Error loading ratings:', error);
            return { ratings: [], averageRating: 0, totalRatings: 0 };
        }
    }

    async function loadMyRating(itemId) {
        try {
            const userId = ApiClient.getCurrentUserId();
            const response = await fetch(ApiClient.getUrl(`api/UserRatings/MyRating/${itemId}?userId=${userId}`), {
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('[UserRatings] Error loading my rating:', error);
            return null;
        }
    }

    async function saveRating(itemId, rating, note) {
        try {
            const userId = ApiClient.getCurrentUserId();
            const user = await ApiClient.getCurrentUser();
            const userName = user ? user.Name : 'Unknown';
            const url = ApiClient.getUrl(`api/UserRatings/Rate?itemId=${itemId}&userId=${userId}&rating=${rating}${note ? '&note=' + encodeURIComponent(note) : ''}&userName=${encodeURIComponent(userName)}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            
            if (!response.ok) {
                const text = await response.text();
                console.error('[UserRatings] Server error:', response.status, text);
                return { success: false, message: `Server error: ${response.status}` };
            }
            
            return await response.json();
        } catch (error) {
            console.error('[UserRatings] Error saving rating:', error);
            return { success: false, message: error.message };
        }
    }

    async function deleteRating(itemId) {
        try {
            const userId = ApiClient.getCurrentUserId();
            const url = ApiClient.getUrl(`api/UserRatings/Rating?itemId=${itemId}&userId=${userId}`);
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            return await response.json();
        } catch (error) {
            console.error('[UserRatings] Error deleting rating:', error);
            return { success: false, message: error.message };
        }
    }

    async function createRatingsUI(itemId) {
        const container = document.createElement('div');
        container.className = 'user-ratings-container';
        container.id = 'user-ratings-ui';
        
        // Header
        const header = document.createElement('div');
        header.className = 'user-ratings-header';
        header.innerHTML = '<span>User Ratings</span>';
        
        const avgSpan = document.createElement('span');
        avgSpan.className = 'user-ratings-average';
        avgSpan.id = 'ratings-average-display';
        header.appendChild(avgSpan);
        container.appendChild(header);
        
        // My Rating Section
        const myRatingSection = document.createElement('div');
        myRatingSection.className = 'user-ratings-my-rating';
        
        const myRatingTitle = document.createElement('div');
        myRatingTitle.className = 'user-ratings-section-title';
        myRatingTitle.textContent = 'Your Rating';
        myRatingSection.appendChild(myRatingTitle);
        
        // Form row for better layout
        const formRow = document.createElement('div');
        formRow.className = 'rating-form-row';
        
        // Column 1: Stars
        const col1 = document.createElement('div');
        col1.className = 'rating-form-col';
        const starContainer = createStarRating(0, true,
            (rating) => updateStarDisplay(starContainer, rating),
            (rating) => {
                currentRating = rating;
                updateStarDisplay(starContainer, rating);
            }
        );
        col1.appendChild(starContainer);
        formRow.appendChild(col1);
        
        // Column 2: Note textarea
        const col2 = document.createElement('div');
        col2.className = 'rating-form-col';
        col2.style.flex = '2';
        const noteInput = document.createElement('textarea');
        noteInput.className = 'rating-note-input';
        noteInput.placeholder = 'Add a note (optional)';
        noteInput.rows = 3;
        col2.appendChild(noteInput);
        formRow.appendChild(col2);
        
        myRatingSection.appendChild(formRow);
        
        // Actions
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'rating-actions';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = 'Save Rating';
        saveBtn.addEventListener('click', async () => {
            if (currentRating === 0) {
                alert('Please select a rating');
                return;
            }
            
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            
            const result = await saveRating(itemId, currentRating, noteInput.value);
            
            if (result.success) {
                saveBtn.textContent = 'Saved!';
                setTimeout(() => {
                    saveBtn.textContent = 'Save Rating';
                    saveBtn.disabled = false;
                }, 2000);
                
                // Reload all ratings
                await displayAllRatings(itemId, container);
                deleteBtn.style.display = 'inline-block';
            } else {
                alert('Error saving rating: ' + result.message);
                saveBtn.textContent = 'Save Rating';
                saveBtn.disabled = false;
            }
        });
        actionsContainer.appendChild(saveBtn);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete Rating';
        deleteBtn.style.display = 'none';
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Delete your rating?')) {
                return;
            }
            
            deleteBtn.disabled = true;
            deleteBtn.textContent = 'Deleting...';
            
            const result = await deleteRating(itemId);
            
            if (result.success) {
                currentRating = 0;
                noteInput.value = '';
                updateStarDisplay(starContainer, 0);
                deleteBtn.style.display = 'none';
                
                await displayAllRatings(itemId, container);
            } else {
                alert('Error deleting rating: ' + result.message);
            }
            
            deleteBtn.textContent = 'Delete Rating';
            deleteBtn.disabled = false;
        });
        actionsContainer.appendChild(deleteBtn);
        
        myRatingSection.appendChild(actionsContainer);
        container.appendChild(myRatingSection);
        
        // All Ratings Section
        const allRatingsSection = document.createElement('div');
        allRatingsSection.className = 'user-ratings-all';
        allRatingsSection.id = 'all-ratings-section';
        container.appendChild(allRatingsSection);
        
        // Load existing rating
        const myRating = await loadMyRating(itemId);
        if (myRating && myRating.rating) {
            currentRating = myRating.rating;
            updateStarDisplay(starContainer, myRating.rating);
            noteInput.value = myRating.note || '';
            deleteBtn.style.display = 'inline-block';
        }
        
        // Load all ratings
        await displayAllRatings(itemId, container);
        
        return container;
    }

    async function displayAllRatings(itemId, container) {
        const allRatingsSection = container.querySelector('#all-ratings-section');
        const avgDisplay = container.querySelector('#ratings-average-display');
        
        if (!allRatingsSection) return;
        
        allRatingsSection.innerHTML = '';
        
        const data = await loadRatings(itemId);
        const ratings = data.ratings || [];
        const averageRating = data.averageRating || 0;
        const totalRatings = data.totalRatings || 0;
        
        // Update average display
        if (totalRatings > 0) {
            avgDisplay.textContent = `★ ${averageRating.toFixed(1)} (${totalRatings} ${totalRatings === 1 ? 'rating' : 'ratings'})`;
        } else {
            avgDisplay.textContent = 'No ratings yet';
        }
        
        if (ratings.length === 0) {
            return;
        }
        
        const title = document.createElement('div');
        title.className = 'user-ratings-section-title';
        title.textContent = 'All Ratings';
        allRatingsSection.appendChild(title);
        
        ratings.forEach(rating => {
            const item = document.createElement('div');
            item.className = 'rating-item';
            
            // Header with user, stars, and date
            const header = document.createElement('div');
            header.className = 'rating-item-header';
            
            const leftSide = document.createElement('div');
            const userName = document.createElement('span');
            userName.className = 'rating-item-user';
            userName.textContent = rating.userName || rating.UserName || 'Unknown User';
            leftSide.appendChild(userName);
            
            const stars = document.createElement('span');
            stars.className = 'rating-item-stars';
            const ratingValue = rating.rating || rating.Rating || 0;
            stars.textContent = '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);
            leftSide.appendChild(stars);
            
            header.appendChild(leftSide);
            
            // Date
            const timestamp = rating.timestamp || rating.Timestamp;
            if (timestamp) {
                const date = document.createElement('span');
                date.className = 'rating-item-date';
                const dateObj = new Date(timestamp);
                date.textContent = dateObj.toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                });
                header.appendChild(date);
            }
            
            item.appendChild(header);
            
            // Note
            const noteText = rating.note || rating.Note;
            if (noteText) {
                const note = document.createElement('div');
                note.className = 'rating-item-note';
                note.textContent = noteText;
                item.appendChild(note);
            }
            
            allRatingsSection.appendChild(item);
        });
    }

    function injectRatingsUI() {
        // Prevent concurrent injections
        if (isInjecting) {
            console.log('[UserRatings] Already injecting, skipping');
            return;
        }
        
        // Check if UI already exists - if so, don't inject again
        const existingUI = document.getElementById('user-ratings-ui');
        if (existingUI) {
            console.log('[UserRatings] UI already exists, skipping injection');
            return;
        }
        
        // Find the detailPagePrimaryContent container
        const targetContainer = document.querySelector('.detailPagePrimaryContent .detailSection');
        
        if (!targetContainer) {
            // Silently return if container not ready yet
            return;
        }
        
        // Get item ID from URL
        let itemId = null;
        const urlParams = new URLSearchParams(window.location.search);
        itemId = urlParams.get('id');
        
        if (!itemId && window.location.hash.includes('?')) {
            const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
            itemId = hashParams.get('id');
        }
        
        if (!itemId) {
            const guidMatch = window.location.href.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
            if (guidMatch) {
                itemId = guidMatch[1];
            }
        }
        
        if (!itemId) {
            console.log('[UserRatings] No item ID found');
            return;
        }
        
        // Skip if it's the same item we just injected for
        if (currentItemId === itemId && existingUI) {
            console.log('[UserRatings] Same item, UI exists, skipping');
            return;
        }
        
        currentItemId = itemId;
        isInjecting = true;
        console.log('[UserRatings] Injecting UI for item:', itemId);
        
        // Create and inject UI at the end of detailSection
        createRatingsUI(itemId).then(ui => {
            targetContainer.appendChild(ui);
            isInjecting = false;
        }).catch(err => {
            console.error('[UserRatings] Error creating UI:', err);
            isInjecting = false;
        });
    }

    // Watch for page changes
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            
            // Remove old UI when navigating to a new page
            const oldUI = document.getElementById('user-ratings-ui');
            if (oldUI) {
                console.log('[UserRatings] Removing old UI on navigation');
                oldUI.remove();
            }
            
            // Hide ratings tab when navigating away from home
            const ratingsTab = document.querySelector('#ratingsTab');
            if (ratingsTab && !url.includes('#/home')) {
                console.log('[UserRatings] Hiding ratings tab on navigation away from home');
                ratingsTab.classList.remove('is-active');
                ratingsTab.style.display = 'none';
            }
            
            // Reset injection flag
            isInjecting = false;
            
            setTimeout(injectRatingsUI, 500);
        }
    }).observe(document.body, { subtree: true, childList: true });

    // Initial injection
    setTimeout(injectRatingsUI, 1000);
    
    // Also check on hash change
    window.addEventListener('hashchange', () => {
        // Remove old UI on hash change
        const oldUI = document.getElementById('user-ratings-ui');
        if (oldUI) {
            oldUI.remove();
        }
        
        // Manage page visibility
        const ratingsTab = document.querySelector('#ratingsTab');
        const currentHash = window.location.hash;
        
        if (ratingsTab) {
            if (!currentHash.includes('home')) {
                // Navigating away from home - hide ratings page
                console.log('[UserRatings] Navigating away from home - hiding ratings page');
                ratingsTab.style.display = 'none';
                ratingsTab.classList.add('hide');
            } else if (currentHash.includes('home')) {
                // Navigating back to home - ensure ratings page is hidden and only show home page
                console.log('[UserRatings] Navigating to home - ensuring clean state');
                ratingsTab.style.display = 'none';
                ratingsTab.classList.add('hide');
                
                // Hide ALL pages except home
                const allPages = document.querySelectorAll('[data-role="page"]');
                allPages.forEach(page => {
                    if (page.id === 'ratingsTab' || !page.classList.contains('homePage')) {
                        page.classList.add('hide');
                        page.style.display = 'none';
                    }
                });
                
                // Show only the home page
                const homePage = document.querySelector('[data-role="page"].homePage:not(#ratingsTab)');
                if (homePage) {
                    homePage.classList.remove('hide');
                    homePage.style.display = '';
                    console.log('[UserRatings] Restored home page only');
                }
            }
        }
        
        isInjecting = false;
        setTimeout(injectRatingsUI, 500);
    });

    console.log('[UserRatings] Setting up tab injection...');

    // Function to display ratings list in the home page content area
    async function displayRatingsList() {
        console.log('[UserRatings] Displaying ratings list...');
        
        // Find or create the ratings tab content container
        let ratingsTabContent = document.querySelector('#ratingsTab');
        
            if (!ratingsTabContent) {
                console.log('[UserRatings] Creating new ratings tab content container...');
                
                // Find the home page - this is the main page container
                const homePage = document.querySelector('[data-role="page"]:not(.hide)');
                console.log('[UserRatings] Found home page:', homePage);
                
                if (!homePage) {
                    console.error('[UserRatings] Could not find home page');
                    return;
                }
                
                // Try multiple selectors to find the content container
                let scrollContainer = homePage.querySelector('.scrollY');
                if (!scrollContainer) {
                    scrollContainer = homePage.querySelector('.pageTabContent');
                }
                if (!scrollContainer) {
                    scrollContainer = homePage.querySelector('.scrollContainer');
                }
                if (!scrollContainer) {
                    // Just use the page itself as the container
                    scrollContainer = homePage;
                }
                
                console.log('[UserRatings] Using container:', scrollContainer.className);
                
                ratingsTabContent = document.createElement('div');
                ratingsTabContent.id = 'ratingsTab';
                ratingsTabContent.className = 'page homePage libraryPage hide';
                ratingsTabContent.setAttribute('data-role', 'page');
                ratingsTabContent.style.position = 'absolute';
                ratingsTabContent.style.top = '0';
                ratingsTabContent.style.left = '0';
                ratingsTabContent.style.right = '0';
                ratingsTabContent.style.bottom = '0';
                ratingsTabContent.style.overflow = 'auto';
                
                // Add as sibling to home page
                homePage.parentNode.appendChild(ratingsTabContent);
                
                console.log('[UserRatings] Created ratings tab as sibling to home page');
            } else {
                console.log('[UserRatings] Found existing ratings tab content');
            }
        
        // Hide the home page and show ratings tab
        const homePage = document.querySelector('[data-role="page"]:not(.hide):not(#ratingsTab)');
        if (homePage) {
            homePage.classList.add('hide');
            console.log('[UserRatings] Hid home page');
        }
        
        ratingsTabContent.classList.remove('hide');
        ratingsTabContent.style.display = 'block';
        ratingsTabContent.style.pointerEvents = 'auto';
        console.log('[UserRatings] Ratings tab now visible');

        // Show loading
        ratingsTabContent.innerHTML = '<div style="padding: 3em 2em; text-align: center; color: rgba(255,255,255,0.6);">Loading ratings...</div>';

        try {
            // Get all rated items
            const ratingsResponse = await fetch(ApiClient.getUrl('api/UserRatings/AllRatedItems'), {
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });

            if (!ratingsResponse.ok) {
                throw new Error('Failed to load ratings');
            }

            const ratingsData = await ratingsResponse.json();
            const items = ratingsData.items || [];

            if (items.length === 0) {
                ratingsTabContent.innerHTML = `
                    <div style="padding: 4em 2em; text-align: center;">
                        <div style="font-size: 4em; margin-bottom: 0.5em; opacity: 0.3;">★</div>
                        <div style="font-size: 1.2em; color: rgba(255, 255, 255, 0.6);">No rated items yet</div>
                    </div>
                `;
                return;
            }

            // Fetch item details from Jellyfin
            const itemPromises = items.map(async (item) => {
                try {
                    const itemDetails = await ApiClient.getItem(ApiClient.getCurrentUserId(), item.itemId);
                    return {
                        ...item,
                        details: itemDetails
                    };
                } catch (error) {
                    console.error('[UserRatings] Error loading item details:', error);
                    return null;
                }
            });

            const itemsWithDetails = (await Promise.all(itemPromises)).filter(item => item !== null);

            if (itemsWithDetails.length === 0) {
                ratingsTabContent.innerHTML = `
                    <div style="padding: 4em 2em; text-align: center;">
                        <div style="font-size: 1.2em; color: rgba(255, 255, 255, 0.6);">Could not load item details</div>
                    </div>
                `;
                return;
            }

            // Get all ratings with timestamps to sort by recently rated
            const allRatingsResponse = await fetch(ApiClient.getUrl('api/UserRatings/AllRatedItems'), {
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            const allRatingsData = await allRatingsResponse.json();

            // Add timestamp info to items
            itemsWithDetails.forEach(item => {
                const ratingInfo = allRatingsData.items.find(r => r.itemId === item.itemId);
                item.lastRatedTimestamp = ratingInfo?.lastRated || 0;
            });

            // Categorize items by type
            const movies = itemsWithDetails.filter(item => item.details.Type === 'Movie');
            const series = itemsWithDetails.filter(item => item.details.Type === 'Series');
            const episodes = itemsWithDetails.filter(item => item.details.Type === 'Episode');

            console.log('[UserRatings] Categorized items - Movies:', movies.length, 'Series:', series.length, 'Episodes:', episodes.length);

            // Sort each category by most recently rated
            const sortByRecent = (a, b) => (b.lastRatedTimestamp || 0) - (a.lastRatedTimestamp || 0);
            movies.sort(sortByRecent);
            series.sort(sortByRecent);
            episodes.sort(sortByRecent);

            // Function to build the ratings grid HTML for a category
            const buildCategoryGrid = (items) => items.map(item => {
                const details = item.details;
                const imageUrl = ApiClient.getImageUrl(item.itemId, {
                    type: 'Primary',
                    maxHeight: 500,
                    quality: 90
                });

                const title = details.Name || 'Unknown';
                const rating = item.averageRating.toFixed(1);
                const count = item.totalRatings;
                const serverId = ApiClient.serverId();

                return `
                    <div data-index="0" data-isfolder="false" data-serverid="${serverId}" data-id="${item.itemId}" data-type="${details.Type}" data-mediatype="Video" class="card portraitCard card-hoverable card-withuserdata">
                        <div class="cardBox cardBox-bottompadded">
                            <div class="cardScalable">
                                <div class="cardPadder cardPadder-portrait"></div>
                                <a href="#/details?id=${item.itemId}&serverId=${serverId}" data-action="link" class="cardImageContainer cardContent itemAction" aria-label="${title}" style="background-image: url('${imageUrl}');"></a>
                                <div class="cardIndicators cardIndicators-bottomright">
                                    <div style="background: rgba(0,0,0,0.85); padding: 0.4em 0.7em; border-radius: 4px; display: inline-flex; align-items: center; gap: 0.3em;">
                                        <span style="color: #ffd700; font-size: 1.1em;">★</span>
                                        <span style="font-weight: 600;">${rating}</span>
                                        <span style="opacity: 0.7; font-size: 0.85em;">(${count})</span>
                                    </div>
                                </div>
                            </div>
                            <div class="cardText cardTextCentered cardText-first">
                                <bdi>
                                    <a href="#/details?id=${item.itemId}&serverId=${serverId}" data-id="${item.itemId}" data-serverid="${serverId}" data-type="${details.Type}" data-action="link" class="itemAction textActionButton" title="${title}">${title}</a>
                                </bdi>
                            </div>
                            <div class="cardText cardTextCentered">&nbsp;</div>
                        </div>
                    </div>
                `;
            }).join('');

            // Build sections HTML matching native Jellyfin structure with explicit spacing
            let sectionsHTML = '<div class="readOnlyContent" style="padding-top: 4em;">';
            
            if (movies.length > 0) {
                sectionsHTML += `
                    <div class="verticalSection">
                        <div class="sectionTitleContainer sectionTitleContainer-cards padded-left">
                            <h2 class="sectionTitle sectionTitle-cards">Recently Rated Movies</h2>
                        </div>
                        <div is="emby-itemscontainer" class="itemsContainer vertical-wrap padded-left padded-right">
                            ${buildCategoryGrid(movies)}
                        </div>
                    </div>
                `;
            }
            
            if (series.length > 0) {
                sectionsHTML += `
                    <div class="verticalSection">
                        <div class="sectionTitleContainer sectionTitleContainer-cards padded-left">
                            <h2 class="sectionTitle sectionTitle-cards">Recently Rated Shows</h2>
                        </div>
                        <div is="emby-itemscontainer" class="itemsContainer vertical-wrap padded-left padded-right">
                            ${buildCategoryGrid(series)}
                        </div>
                    </div>
                `;
            }
            
            if (episodes.length > 0) {
                sectionsHTML += `
                    <div class="verticalSection">
                        <div class="sectionTitleContainer sectionTitleContainer-cards padded-left">
                            <h2 class="sectionTitle sectionTitle-cards">Recently Rated Episodes</h2>
                        </div>
                        <div is="emby-itemscontainer" class="itemsContainer vertical-wrap padded-left padded-right">
                            ${buildCategoryGrid(episodes)}
                        </div>
                    </div>
                `;
            }
            
            sectionsHTML += '</div>';
            
            // Add "All Rated Items" section with pagination and sorting
            let currentPage = 1;
            const itemsPerPage = 24;
            let currentSort = 'rating-desc';
            let allItems = [...itemsWithDetails];
            
            const renderAllItemsSection = (page, sortBy) => {
                // Sort items
                switch(sortBy) {
                    case 'rating-desc':
                        allItems.sort((a, b) => b.averageRating - a.averageRating);
                        break;
                    case 'rating-asc':
                        allItems.sort((a, b) => a.averageRating - b.averageRating);
                        break;
                    case 'recent':
                        allItems.sort((a, b) => (b.lastRatedTimestamp || 0) - (a.lastRatedTimestamp || 0));
                        break;
                    case 'title':
                        allItems.sort((a, b) => (a.details.Name || '').localeCompare(b.details.Name || ''));
                        break;
                }
                
                // Pagination
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedItems = allItems.slice(startIndex, endIndex);
                const totalPages = Math.ceil(allItems.length / itemsPerPage);
                
                const allItemsSection = document.querySelector('#allItemsSection');
                if (!allItemsSection) return;
                
                allItemsSection.innerHTML = `
                    <div class="verticalSection">
                        <div class="sectionTitleContainer sectionTitleContainer-cards padded-left" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1em;">
                            <h2 class="sectionTitle sectionTitle-cards">All Rated Items (${allItems.length})</h2>
                            <div style="display: flex; gap: 1em; align-items: center;">
                                <label style="color: rgba(255,255,255,0.7); font-size: 0.9em;">Sort by:</label>
                                <select id="sortSelect" style="background: rgba(0,0,0,0.3); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px; padding: 0.5em 1em; font-size: 0.9em;">
                                    <option value="rating-desc" ${sortBy === 'rating-desc' ? 'selected' : ''}>Highest Rated</option>
                                    <option value="rating-asc" ${sortBy === 'rating-asc' ? 'selected' : ''}>Lowest Rated</option>
                                    <option value="recent" ${sortBy === 'recent' ? 'selected' : ''}>Recently Rated</option>
                                    <option value="title" ${sortBy === 'title' ? 'selected' : ''}>Title (A-Z)</option>
                                </select>
                            </div>
                        </div>
                        <div is="emby-itemscontainer" class="itemsContainer vertical-wrap padded-left padded-right">
                            ${buildCategoryGrid(paginatedItems)}
                        </div>
                        <div class="padded-left padded-right" style="display: flex; justify-content: center; align-items: center; gap: 1em; padding: 2em; flex-wrap: wrap;">
                            <button id="prevPage" class="emby-button emby-button-backdropfilter" ${page === 1 ? 'disabled' : ''} style="padding: 0.6em 1.5em;">
                                <span class="material-icons" style="vertical-align: middle;">chevron_left</span> Previous
                            </button>
                            <span style="color: rgba(255,255,255,0.8);">Page ${page} of ${totalPages}</span>
                            <button id="nextPage" class="emby-button emby-button-backdropfilter" ${page === totalPages ? 'disabled' : ''} style="padding: 0.6em 1.5em;">
                                Next <span class="material-icons" style="vertical-align: middle;">chevron_right</span>
                            </button>
                        </div>
                    </div>
                `;
                
                // Add event listeners
                const sortSelect = document.querySelector('#sortSelect');
                if (sortSelect) {
                    sortSelect.addEventListener('change', (e) => {
                        currentSort = e.target.value;
                        currentPage = 1;
                        renderAllItemsSection(currentPage, currentSort);
                    });
                }
                
                const prevBtn = document.querySelector('#prevPage');
                if (prevBtn && !prevBtn.disabled) {
                    prevBtn.addEventListener('click', () => {
                        currentPage--;
                        renderAllItemsSection(currentPage, currentSort);
                        allItemsSection.scrollIntoView({ behavior: 'smooth' });
                    });
                }
                
                const nextBtn = document.querySelector('#nextPage');
                if (nextBtn && !nextBtn.disabled) {
                    nextBtn.addEventListener('click', () => {
                        currentPage++;
                        renderAllItemsSection(currentPage, currentSort);
                        allItemsSection.scrollIntoView({ behavior: 'smooth' });
                    });
                }
            };
            
            sectionsHTML += '<div id="allItemsSection"></div></div>';
            
            console.log('[UserRatings] Sections HTML length:', sectionsHTML.length);
            console.log('[UserRatings] First 500 chars:', sectionsHTML.substring(0, 500));
            
            // Display the categorized grid
            ratingsTabContent.innerHTML = sectionsHTML;
            ratingsTabContent.style.pointerEvents = 'auto'; // Ensure clicks work
            
            // Render the "All Items" section
            renderAllItemsSection(currentPage, currentSort);
            
            // Add click handlers to cards
            ratingsTabContent.querySelectorAll('.card[data-item-id]').forEach(card => {
                card.addEventListener('click', (e) => {
                    const itemId = card.getAttribute('data-item-id');
                    const serverId = ApiClient.serverId();
                    window.location.hash = `#/details?id=${itemId}&serverId=${serverId}`;
                });
            });
            
            console.log('[UserRatings] Content rendered, checking for headers...');
            const headers = ratingsTabContent.querySelectorAll('.sectionTitle');
            console.log('[UserRatings] Found', headers.length, 'section headers');

        } catch (error) {
            console.error('[UserRatings] Error displaying ratings list:', error);
            ratingsTabContent.innerHTML = `
                <div style="padding: 2em; background: rgba(229, 57, 53, 0.2); border: 1px solid rgba(229, 57, 53, 0.5); border-radius: 8px; color: #ff6b6b; margin: 2em;">
                    <strong>Error:</strong> ${error.message}
                </div>
            `;
        }
    }

    // Inject ratings tab on home screen
    function injectRatingsTab() {
        try {
            // Only inject on home page
            if (!window.location.hash.includes('home')) {
                return;
            }
            
            console.log('[UserRatings] ===== TAB INJECTION ATTEMPT =====');
            console.log('[UserRatings] Current URL hash:', window.location.hash);
            console.log('[UserRatings] Page ready state:', document.readyState);
            
            // Check if tab already exists
            const existingTab = document.querySelector('[data-ratings-tab="true"]');
            if (existingTab) {
                console.log('[UserRatings] Tab already exists, skipping injection');
                return;
            }

            // Try to find the tabs container by locating the Home button first
            console.log('[UserRatings] Strategy 1: Looking for Home button...');
            const homeButton = Array.from(document.querySelectorAll('.emby-tab-button')).find(btn => 
                btn.textContent.trim().toLowerCase().includes('home')
            );
            
            let tabsSlider = null;
            
            if (homeButton) {
                console.log('[UserRatings] ✓ Found Home button, getting parent container...');
                tabsSlider = homeButton.parentElement;
                console.log('[UserRatings] Parent container:', tabsSlider.className);
            } else {
                console.log('[UserRatings] Home button not found, trying Strategy 2...');
                
                // Strategy 2: Look for .emby-tabs-slider
                console.log('[UserRatings] Looking for .emby-tabs-slider...');
                tabsSlider = document.querySelector('.emby-tabs-slider');
            }
            
            console.log('[UserRatings] Tabs slider found:', !!tabsSlider);
            
            if (!tabsSlider) {
                console.warn('[UserRatings] ❌ INJECTION FAILED: Could not find tabs container');
                
                // Try alternative selectors and log what we find
                const altSelectors = [
                    '.homePage .emby-tabs-slider',
                    '[data-role="page"] .emby-tabs-slider',
                    '.emby-tabs',
                    '.tabControls',
                    '.emby-tab-button'
                ];
                
                console.log('[UserRatings] Searching for alternative selectors...');
                for (const selector of altSelectors) {
                    const element = document.querySelector(selector);
                    console.log(`[UserRatings] ${selector}: ${element ? 'FOUND ✓' : 'not found'}`);
                    if (element) {
                        console.log(`[UserRatings] Element tag: ${element.tagName}, class: ${element.className}`);
                    }
                }
                
                console.log('[UserRatings] Will retry...');
                return;
            }

            console.log('[UserRatings] ✓ Found tabs container, proceeding with injection...');

        // Get the next index
        const existingTabs = tabsSlider.querySelectorAll('.emby-tab-button');
        const nextIndex = existingTabs.length;

        // Create the ratings tab button
        const ratingsTab = document.createElement('button');
        ratingsTab.type = 'button';
        ratingsTab.setAttribute('is', 'emby-button');
        ratingsTab.className = 'emby-tab-button emby-button';
        ratingsTab.setAttribute('data-index', nextIndex);
        ratingsTab.setAttribute('data-ratings-tab', 'true');
        ratingsTab.innerHTML = '<div class="emby-button-foreground">User Ratings</div>';

        // Add click handler
        ratingsTab.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('[UserRatings] Tab clicked');
            
            // Remove active class from all tabs
            tabsSlider.querySelectorAll('.emby-tab-button').forEach(tab => {
                tab.classList.remove('emby-tab-button-active');
            });
            
            // Add active class to this tab
            ratingsTab.classList.add('emby-tab-button-active');
            
            console.log('[UserRatings] Calling displayRatingsList...');
            try {
                // Load and display ratings list in the home page
                await displayRatingsList();
                console.log('[UserRatings] displayRatingsList completed');
            } catch (error) {
                console.error('[UserRatings] Error in displayRatingsList:', error);
            }
        });

        // Add listeners to other tabs to properly switch content
        const otherTabs = tabsSlider.querySelectorAll('.emby-tab-button:not([data-ratings-tab="true"])');
        otherTabs.forEach((tab, index) => {
            tab.addEventListener('click', function(e) {
                console.log('[UserRatings] Other tab clicked, switching away from ratings');
                
                // Hide ratings tab
                const ratingsTabContent = document.querySelector('#ratingsTab');
                if (ratingsTabContent) {
                    ratingsTabContent.style.display = 'none';
                    ratingsTabContent.classList.add('hide');
                }
                
                // Show the home page
                const homePage = document.querySelector('[data-role="page"].hide:not(#ratingsTab)');
                if (homePage) {
                    homePage.classList.remove('hide');
                    console.log('[UserRatings] Restored home page');
                }
            }, true); // Use capture to run before Jellyfin's handler
        });

            // Insert the tab
            tabsSlider.appendChild(ratingsTab);
            console.log('[UserRatings] ✅ SUCCESS: Tab injected into home screen!');
            console.log('[UserRatings] ===== INJECTION COMPLETE =====');
            
        } catch (error) {
            console.error('[UserRatings] ❌ INJECTION ERROR:', error);
            console.error('[UserRatings] Error stack:', error.stack);
            console.log('[UserRatings] ===== INJECTION FAILED =====');
        }
    }

    // Try to inject tab on page load and navigation
    function checkAndInjectTab() {
        injectRatingsTab();
    }

    console.log('[UserRatings] Starting tab injection attempts...');
    
    // Try immediately and repeatedly
    injectRatingsTab();
    setTimeout(injectRatingsTab, 100);
    setTimeout(injectRatingsTab, 500);
    setTimeout(injectRatingsTab, 1000);
    setTimeout(injectRatingsTab, 2000);
    setTimeout(injectRatingsTab, 3000);
    setInterval(injectRatingsTab, 2000);

    // Watch for page changes
    window.addEventListener('hashchange', () => {
        setTimeout(injectRatingsTab, 100);
        setTimeout(injectRatingsTab, 500);
    });

    // Watch for DOM changes to inject tab
    new MutationObserver(() => {
        injectRatingsTab();
    }).observe(document.body, {
        subtree: true,
        childList: true
    });

    console.log('[UserRatings] Plugin initialized with inline interface and navigation');
})();