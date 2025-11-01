(function() {
    'use strict';

    console.log('[UserRatings] Loading plugin...');

    // CSS for modal and star ratings
    const style = document.createElement('style');
    style.textContent = `
        .user-ratings-modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .user-ratings-modal-backdrop.show {
            display: flex;
            opacity: 1;
        }
        .user-ratings-modal {
            background: #1c1c1c;
            border-radius: 8px;
            padding: 2em;
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            transform: scale(0.9);
            transition: transform 0.3s;
            color: #ffffff;
        }
        .user-ratings-modal-backdrop.show .user-ratings-modal {
            transform: scale(1);
        }
        .user-ratings-modal-close {
            float: right;
            font-size: 2em;
            cursor: pointer;
            color: #999;
            line-height: 0.8;
            margin-top: -0.5em;
        }
        .user-ratings-modal-close:hover {
            color: #fff;
        }
        .user-ratings-title {
            font-size: 1.5em;
            margin-bottom: 1em;
            font-weight: 500;
            clear: both;
            color: #ffffff;
        }
        .user-ratings-item-title {
            font-size: 1.2em;
            margin-bottom: 0.5em;
            color: #00a4dc;
        }
        .user-ratings-button {
            position: fixed;
            bottom: 100px;
            right: 20px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #00a4dc;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 9999;
            transition: transform 0.2s, background 0.2s;
            display: none;
            align-items: center;
            justify-content: center;
        }
        .user-ratings-button.show {
            display: flex;
        }
        .user-ratings-button:hover {
            background: #0080b3;
            transform: scale(1.1);
        }
        .user-ratings-button:active {
            transform: scale(0.95);
        }
        .star-rating {
            display: inline-flex;
            gap: 0.25em;
            cursor: pointer;
            font-size: 2em;
            margin: 1em 0;
        }
        .star-rating .star {
            color: #888;
            transition: color 0.2s;
        }
        .star-rating .star.filled {
            color: #ffd700;
        }
        .star-rating .star:hover,
        .star-rating .star.hover {
            color: #ffed4e;
        }
        .rating-note {
            margin-top: 1em;
        }
        .rating-note input {
            width: 100%;
            padding: 0.5em;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: white;
            font-size: 1em;
        }
        .rating-actions {
            margin-top: 1em;
            display: flex;
            gap: 0.5em;
        }
        .rating-actions button {
            padding: 0.75em 1.5em;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            font-size: 1em;
        }
        .rating-actions .save-btn {
            background: #00a4dc;
            color: white;
        }
        .rating-actions .save-btn:hover {
            background: #0080b3;
        }
        .rating-actions .delete-btn {
            background: #e53935;
            color: white;
        }
        .rating-actions .delete-btn:hover {
            background: #c62828;
        }
        .other-ratings {
            margin-top: 2em;
            padding-top: 1em;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .other-ratings-title {
            font-size: 1.2em;
            margin-bottom: 1em;
            opacity: 0.8;
            color: #ffffff;
        }
        .rating-item {
            margin: 0.75em 0;
            padding: 0.75em;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            color: #ffffff;
        }
        .rating-item-user {
            font-weight: 500;
            color: #ffffff;
        }
        .rating-item-stars {
            color: #ffd700;
            margin-left: 0.5em;
        }
        .rating-item-note {
            margin-top: 0.5em;
            opacity: 0.8;
            font-size: 0.9em;
            color: #cccccc;
        }
        .rating-average {
            display: inline-block;
            margin-left: 1em;
            font-size: 1.2em;
            color: #ffd700;
        }
    `;
    document.head.appendChild(style);

    let currentItemId = null;
    let currentItemName = null;

    function createStarRating(rating, interactive, onHover, onClick) {
        const container = document.createElement('div');
        container.className = 'star-rating';
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.className = 'star' + (i <= rating ? ' filled' : '');
            star.textContent = '★';
            star.dataset.rating = i;
            
            if (interactive) {
                star.addEventListener('mouseenter', () => onHover(i));
                star.addEventListener('click', () => onClick(i));
            }
            
            container.appendChild(star);
        }
        
        if (interactive) {
            container.addEventListener('mouseleave', () => onHover(rating));
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
            return data.ratings || [];
        } catch (error) {
            console.error('[UserRatings] Error loading ratings:', error);
            return [];
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
            const user = ApiClient.getCurrentUser();
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

    function createModal() {
        const backdrop = document.createElement('div');
        backdrop.className = 'user-ratings-modal-backdrop';
        
        const modal = document.createElement('div');
        modal.className = 'user-ratings-modal';
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'user-ratings-modal-close';
        closeBtn.textContent = '×';
        closeBtn.addEventListener('click', () => {
            backdrop.classList.remove('show');
            setTimeout(() => backdrop.style.display = 'none', 300);
        });
        modal.appendChild(closeBtn);
        
        const title = document.createElement('div');
        title.className = 'user-ratings-title';
        title.textContent = 'Rate This';
        modal.appendChild(title);
        
        const itemTitle = document.createElement('div');
        itemTitle.className = 'user-ratings-item-title';
        itemTitle.id = 'ratings-item-title';
        modal.appendChild(itemTitle);

        let currentRating = 0;
        let currentNote = '';
        
        const starContainer = createStarRating(0, true, 
            (rating) => updateStarDisplay(starContainer, rating),
            (rating) => {
                currentRating = rating;
                updateStarDisplay(starContainer, rating);
            }
        );
        modal.appendChild(starContainer);

        const noteContainer = document.createElement('div');
        noteContainer.className = 'rating-note';
        const noteInput = document.createElement('input');
        noteInput.type = 'text';
        noteInput.placeholder = 'Add a note (optional)';
        noteInput.addEventListener('input', (e) => {
            currentNote = e.target.value;
        });
        noteContainer.appendChild(noteInput);
        modal.appendChild(noteContainer);

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
            
            const result = await saveRating(currentItemId, currentRating, currentNote);
            
            if (result.success) {
                saveBtn.textContent = 'Saved!';
                setTimeout(() => {
                    saveBtn.textContent = 'Save Rating';
                    saveBtn.disabled = false;
                }, 2000);
                
                loadAndDisplayOtherRatings(currentItemId, modal);
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
            
            const result = await deleteRating(currentItemId);
            
            if (result.success) {
                currentRating = 0;
                currentNote = '';
                noteInput.value = '';
                updateStarDisplay(starContainer, 0);
                deleteBtn.style.display = 'none';
                
                loadAndDisplayOtherRatings(currentItemId, modal);
            } else {
                alert('Error deleting rating: ' + result.message);
            }
            
            deleteBtn.textContent = 'Delete Rating';
            deleteBtn.disabled = false;
        });
        actionsContainer.appendChild(deleteBtn);
        
        modal.appendChild(actionsContainer);
        
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        
        // Click backdrop to close
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.classList.remove('show');
                setTimeout(() => backdrop.style.display = 'none', 300);
            }
        });
        
        return { backdrop, modal, starContainer, noteInput, deleteBtn, itemTitle };
    }

    async function loadAndDisplayOtherRatings(itemId, modal) {
        const existingSection = modal.querySelector('.other-ratings');
        if (existingSection) {
            existingSection.remove();
        }

        const ratings = await loadRatings(itemId);
        
        if (ratings.length === 0) {
            return;
        }

        const otherRatings = document.createElement('div');
        otherRatings.className = 'other-ratings';
        
        const otherTitle = document.createElement('div');
        otherTitle.className = 'other-ratings-title';
        
        const average = ratings.reduce((sum, r) => sum + (r.rating || r.Rating || 0), 0) / ratings.length;
        const avgSpan = document.createElement('span');
        avgSpan.className = 'rating-average';
        avgSpan.textContent = `★ ${average.toFixed(1)} (${ratings.length} ${ratings.length === 1 ? 'rating' : 'ratings'})`;
        
        otherTitle.textContent = 'All Ratings';
        otherTitle.appendChild(avgSpan);
        otherRatings.appendChild(otherTitle);

        ratings.forEach(rating => {
            const item = document.createElement('div');
            item.className = 'rating-item';
            
            const userLine = document.createElement('div');
            const userName = document.createElement('span');
            userName.className = 'rating-item-user';
            userName.textContent = rating.userName || rating.UserName || 'Unknown';
            userLine.appendChild(userName);
            
            const stars = document.createElement('span');
            stars.className = 'rating-item-stars';
            const ratingValue = rating.rating || rating.Rating || 0;
            stars.textContent = '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);
            userLine.appendChild(stars);
            
            item.appendChild(userLine);
            
            const noteText = rating.note || rating.Note;
            if (noteText) {
                const note = document.createElement('div');
                note.className = 'rating-item-note';
                note.textContent = noteText;
                item.appendChild(note);
            }
            
            otherRatings.appendChild(item);
        });
        
        modal.appendChild(otherRatings);
    }

    const modalElements = createModal();

    async function openRatingModal(itemId, itemName) {
        currentItemId = itemId;
        currentItemName = itemName;
        
        modalElements.itemTitle.textContent = itemName;
        modalElements.backdrop.style.display = 'flex';
        setTimeout(() => modalElements.backdrop.classList.add('show'), 10);
        
        // Load existing rating
        const myRating = await loadMyRating(itemId);
        if (myRating && myRating.rating) {
            updateStarDisplay(modalElements.starContainer, myRating.rating);
            modalElements.noteInput.value = myRating.note || '';
            modalElements.deleteBtn.style.display = 'inline-block';
        } else {
            updateStarDisplay(modalElements.starContainer, 0);
            modalElements.noteInput.value = '';
            modalElements.deleteBtn.style.display = 'none';
        }
        
        // Load other ratings
        await loadAndDisplayOtherRatings(itemId, modalElements.modal);
    }

    // Create floating button
    const floatingButton = document.createElement('button');
    floatingButton.className = 'user-ratings-button';
    floatingButton.textContent = '★';
    floatingButton.title = 'Rate this item';
    floatingButton.addEventListener('click', () => {
        if (currentItemId && currentItemName) {
            openRatingModal(currentItemId, currentItemName);
        }
    });
    document.body.appendChild(floatingButton);

    function updateButtonVisibility() {
        // Check if we're on an item details page
        const path = window.location.pathname;
        const hash = window.location.hash;
        const fullUrl = path + hash + window.location.search;
        
        // Try multiple ways to get the item ID
        let itemId = null;
        let itemName = null;
        
        // Method 1: From URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        itemId = urlParams.get('id');
        
        // Method 2: From hash parameters
        if (!itemId && hash.includes('?')) {
            const hashParams = new URLSearchParams(hash.split('?')[1]);
            itemId = hashParams.get('id');
        }
        
        // Method 3: Match any GUID pattern in the URL
        if (!itemId) {
            const guidMatch = fullUrl.match(/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i);
            if (guidMatch) {
                // Verify this is on a details page
                if (fullUrl.includes('details') || fullUrl.includes('item') || 
                    document.querySelector('.detailPage, .itemDetailsPage, .detailsPage')) {
                    itemId = guidMatch[1];
                }
            }
        }
        
        if (itemId) {
            // Try to get item name from page - more selectors
            const titleSelectors = [
                'h1.pageTitle',
                'h1',
                '.itemName',
                '.detailPagePrimaryTitle',
                '.detailsTitle',
                '[class*="itemName"]',
                '[class*="title"]'
            ];
            
            for (const selector of titleSelectors) {
                const el = document.querySelector(selector);
                if (el && el.textContent && el.textContent.trim() && 
                    !el.textContent.includes('Dashboard') && 
                    !el.textContent.includes('Settings')) {
                    itemName = el.textContent.trim();
                    break;
                }
            }
            
            if (!itemName) itemName = 'this item';
            
            currentItemId = itemId;
            currentItemName = itemName;
            floatingButton.classList.add('show');
            console.log('[UserRatings] Item detected:', itemId, itemName);
        } else {
            floatingButton.classList.remove('show');
            currentItemId = null;
            currentItemName = null;
        }
    }

    // Watch for page changes
    let lastUrl = location.href;
    new MutationObserver(() => {
        const url = location.href;
        if (url !== lastUrl) {
            lastUrl = url;
            setTimeout(updateButtonVisibility, 500);
        }
    }).observe(document.body, { subtree: true, childList: true });

    // Initial check
    setTimeout(updateButtonVisibility, 1000);
    
    // Also check on hash change
    window.addEventListener('hashchange', () => setTimeout(updateButtonVisibility, 500));

    console.log('[UserRatings] Plugin initialized with modal interface');
})();
