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
            padding: 1.5em;
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
            padding: 0.6em 0.8em;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 6px;
            color: white;
            font-size: 0.95em;
            font-family: inherit;
            transition: border-color 0.2s, background 0.2s;
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
        
        // Column 2: Note input
        const col2 = document.createElement('div');
        col2.className = 'rating-form-col';
        col2.style.flex = '2';
        const noteInput = document.createElement('input');
        noteInput.type = 'text';
        noteInput.className = 'rating-note-input';
        noteInput.placeholder = 'Add a note (optional)';
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
        // Remove existing UI if any
        const existingUI = document.getElementById('user-ratings-ui');
        if (existingUI) {
            existingUI.remove();
        }
        
        // Find the detailPageSecondaryContainer
        const targetContainer = document.querySelector('.detailPageSecondaryContainer .detailPageContent');
        
        if (!targetContainer) {
            console.log('[UserRatings] Target container not found');
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
        
        currentItemId = itemId;
        console.log('[UserRatings] Injecting UI for item:', itemId);
        
        // Create and inject UI
        createRatingsUI(itemId).then(ui => {
            targetContainer.insertBefore(ui, targetContainer.firstChild);
        });
    }

    // Watch for page changes
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(injectRatingsUI, 500);
        }
    }).observe(document.body, { subtree: true, childList: true });

    // Initial injection
    setTimeout(injectRatingsUI, 1000);
    
    // Also check on hash change
    window.addEventListener('hashchange', () => setTimeout(injectRatingsUI, 500));

    console.log('[UserRatings] Plugin initialized with inline interface');
})();
