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
            padding: 1.8em 2em;
            margin-top: 2em;
            margin-bottom: 2em;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-sizing: border-box;
        }
        .user-ratings-container * {
            box-sizing: border-box;
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
            font-size: 1.15em;
            margin-bottom: 0.3em;
            color: #ffffff;
            font-weight: 600;
        }
        .user-ratings-section-subtitle {
            font-size: 0.9em;
            color: rgba(255, 255, 255, 0.5);
            margin-bottom: 0.8em;
        }
        .rating-form-row {
            display: block;
            margin-top: 0.5em;
        }
        .rating-form-section {
            margin-bottom: 1.6em;
        }
        .star-rating-container {
            display: flex;
            align-items: center;
            gap: 0.8em;
            margin-bottom: 0.5em;
        }
        .star-rating {
            display: inline-flex;
            gap: 0.25em;
            cursor: pointer;
            font-size: 1.9em;
        }
        .star-rating .star {
            color: rgba(255, 255, 255, 0.15);
            transition: color 0.2s, transform 0.15s;
            cursor: pointer;
            filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
        }
        .star-rating .star.filled {
            color: #ffd700;
        }
        .star-rating .star:hover {
            color: #ffed4e;
            transform: scale(1.15);
        }
        .rating-prompt {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.9em;
        }
        .rating-note-input {
            width: 100%;
            padding: 1em;
            background: rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: white;
            font-size: 0.95em;
            font-family: inherit;
            transition: border-color 0.2s, background 0.2s;
            resize: vertical;
            min-height: 100px;
            line-height: 1.6;
        }
        .rating-note-input:focus {
            outline: none;
            border-color: #00a4dc;
            background: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 0 1px #00a4dc;
        }
        .rating-note-input::placeholder {
            color: rgba(255, 255, 255, 0.35);
        }
        .rating-char-count {
            font-size: 0.85em;
            color: rgba(255, 255, 255, 0.4);
            margin-top: 0.5em;
        }
        .rating-char-count.error {
            color: #ff6b6b;
        }
        .rating-actions {
            margin-top: 1.2em;
            display: flex;
            gap: 0.75em;
            flex-wrap: wrap;
        }
        .rating-actions button {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            outline: 0;
            margin: 0;
            cursor: pointer;
            user-select: none;
            vertical-align: middle;
            text-decoration: none;
            font-family: inherit;
            font-weight: 500;
            font-size: 0.9375rem;
            line-height: 1.75;
            letter-spacing: 0.02857em;
            text-transform: uppercase;
            min-width: 64px;
            padding: 8px 22px;
            border-radius: 4px;
            transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
            border: 0;
        }
        .rating-actions .save-btn {
            background-color: #e53935;
            color: #fff;
            box-shadow: 0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12);
            flex: 1;
            min-width: 200px;
        }
        .rating-actions .save-btn:hover:not(:disabled) {
            background-color: #d32f2f;
            box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12);
        }
        .rating-actions .save-btn:active:not(:disabled) {
            box-shadow: 0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12);
        }
        .rating-actions .save-btn:disabled {
            background-color: rgba(255, 255, 255, 0.12);
            color: rgba(255, 255, 255, 0.3);
            cursor: default;
            pointer-events: none;
            box-shadow: none;
        }
        .rating-actions .delete-btn {
            background-color: transparent;
            color: rgba(255, 255, 255, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.23);
            padding: 7px 21px;
        }
        .rating-actions .delete-btn:hover {
            background-color: rgba(255, 255, 255, 0.08);
            border-color: rgba(255, 255, 255, 0.23);
        }
        .rating-actions .delete-btn:active {
            background-color: rgba(255, 255, 255, 0.12);
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
    let hasTriedRefresh = false; // Flag to prevent infinite refresh loops
    let isNavigating = false; // Flag to prevent refresh during navigation
    let lastNavigationTime = 0; // Track when navigation occurred

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

    function seamlessPageRefresh(itemId, force = false) {
        // Only refresh on details page
        const currentHash = window.location.hash;
        const currentUrl = window.location.href;
        const isDetailsPage = currentHash.includes('#/details') || currentHash.includes('/details') || 
                              currentUrl.includes('/details') || 
                              (itemId && currentHash.includes(itemId));
        
        if (!isDetailsPage) {
            console.log('[UserRatings] Skipping refresh - not on details page');
            return;
        }
        
        // Don't refresh if we recently refreshed (prevent loops)
        // Unless forced (from final zero-size check)
        if (!force && hasTriedRefresh) {
            console.log('[UserRatings] Skipping refresh - already tried once');
            return;
        }
        
        console.log('[UserRatings] Performing hard page refresh', force ? '(FORCED)' : '');
        hasTriedRefresh = true;
        
        // Hard refresh - reload the page completely
        // This bypasses cache and reloads everything fresh
        window.location.reload(true);
    }

    async function createRatingsUI(itemId) {
        console.log('[UserRatings] → createRatingsUI started for:', itemId);
        const container = document.createElement('div');
        container.className = 'user-ratings-container';
        container.id = 'user-ratings-ui';
        
        // Get item name for personalized heading
        let itemName = 'this item';
        try {
            console.log('[UserRatings] → Loading item details...');
            const itemDetails = await ApiClient.getItem(ApiClient.getCurrentUserId(), itemId);
            if (itemDetails && itemDetails.Name) {
                itemName = itemDetails.Name;
            }
            console.log('[UserRatings] → Item details loaded:', itemName);
        } catch (error) {
            console.log('[UserRatings] Could not load item name:', error);
        }
        
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
        
        // Star Rating Section
        const starSection = document.createElement('div');
        starSection.className = 'rating-form-section';
        
        const myRatingTitle = document.createElement('div');
        myRatingTitle.className = 'user-ratings-section-title';
        myRatingTitle.textContent = `How would you rate ${itemName}?`;
        starSection.appendChild(myRatingTitle);
        
        const starRatingContainer = document.createElement('div');
        starRatingContainer.className = 'star-rating-container';
        
        const starContainer = createStarRating(0, true,
            (rating) => {
                updateStarDisplay(starContainer, rating);
                ratingPrompt.style.display = rating === 0 ? 'inline' : 'none';
            },
            (rating) => {
                currentRating = rating;
                updateStarDisplay(starContainer, rating);
                ratingPrompt.style.display = 'none';
            }
        );
        starRatingContainer.appendChild(starContainer);
        
        const ratingPrompt = document.createElement('span');
        ratingPrompt.className = 'rating-prompt';
        ratingPrompt.textContent = 'Select your rating';
        starRatingContainer.appendChild(ratingPrompt);
        
        starSection.appendChild(starRatingContainer);
        myRatingSection.appendChild(starSection);
        
        // Review Text Section
        const reviewSection = document.createElement('div');
        reviewSection.className = 'rating-form-section';
        
        const reviewTitle = document.createElement('div');
        reviewTitle.className = 'user-ratings-section-title';
        reviewTitle.textContent = 'Tell us about your experience';
        reviewSection.appendChild(reviewTitle);
        
        const reviewSubtitle = document.createElement('div');
        reviewSubtitle.className = 'user-ratings-section-subtitle';
        reviewSubtitle.textContent = 'Share your thoughts (optional)';
        reviewSection.appendChild(reviewSubtitle);
        
        const noteInput = document.createElement('textarea');
        noteInput.className = 'rating-note-input';
        noteInput.placeholder = 'Start your review...';
        reviewSection.appendChild(noteInput);
        
        const charCount = document.createElement('div');
        charCount.className = 'rating-char-count';
        charCount.textContent = '0 characters';
        reviewSection.appendChild(charCount);
        
        // Character counter
        noteInput.addEventListener('input', () => {
            const length = noteInput.value.length;
            charCount.textContent = `${length} character${length !== 1 ? 's' : ''}`;
        });
        
        myRatingSection.appendChild(reviewSection);
        
        // Actions
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'rating-actions';
        
        const saveBtn = document.createElement('button');
        saveBtn.className = 'save-btn';
        saveBtn.textContent = 'Post Rating';
        saveBtn.addEventListener('click', async () => {
            if (currentRating === 0) {
                alert('Please select a rating');
                return;
            }
            
            saveBtn.disabled = true;
            saveBtn.textContent = 'Posting...';
            
            const result = await saveRating(itemId, currentRating, noteInput.value);
            
            if (result.success) {
                saveBtn.textContent = 'Posted!';
                setTimeout(() => {
                    saveBtn.textContent = 'Post Rating';
                    saveBtn.disabled = false;
                }, 2000);
                
                // Reload all ratings
                await displayAllRatings(itemId, container);
                deleteBtn.style.display = 'inline-block';
            } else {
                alert('Error saving rating: ' + result.message);
                saveBtn.textContent = 'Post Rating';
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
        console.log('[UserRatings] → Loading my rating...');
        const myRating = await loadMyRating(itemId);
        console.log('[UserRatings] → My rating loaded:', myRating);
        if (myRating && myRating.rating) {
            currentRating = myRating.rating;
            updateStarDisplay(starContainer, myRating.rating);
            ratingPrompt.style.display = 'none';
            noteInput.value = myRating.note || '';
            // Update character counter
            const length = noteInput.value.length;
            charCount.textContent = `${length} character${length !== 1 ? 's' : ''}`;
            deleteBtn.style.display = 'inline-block';
        }
        
        // Load all ratings
        console.log('[UserRatings] → Loading all ratings...');
        await displayAllRatings(itemId, container);
        console.log('[UserRatings] → All ratings loaded, returning container');
        
        // Check size after all async operations complete
        setTimeout(() => {
            const rect = container.getBoundingClientRect();
            console.log('[UserRatings] Post-load size check:', rect.width, 'x', rect.height);
            if (rect.width === 0 && rect.height === 0) {
                console.log('[UserRatings] Container has zero size after loading, will trigger refresh');
                // Store flag for size check to handle
                container.dataset.zeroSize = 'true';
            }
        }, 200);
        
        return container;
    }

    async function displayAllRatings(itemId, container) {
        console.log('[UserRatings] → displayAllRatings started');
        const allRatingsSection = container.querySelector('#all-ratings-section');
        const avgDisplay = container.querySelector('#ratings-average-display');
        
        if (!allRatingsSection) {
            console.log('[UserRatings] → No allRatingsSection found, returning early');
            return;
        }
        
        allRatingsSection.innerHTML = '';
        
        console.log('[UserRatings] → Calling loadRatings...');
        const data = await loadRatings(itemId);
        console.log('[UserRatings] → loadRatings returned, processing data...');
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
        console.log('[UserRatings] → displayAllRatings completed');
    }

    let injectionAttempts = 0;
    const maxInjectionAttempts = 30; // Increased from 20
    
    function injectRatingsUI() {
        // Prevent concurrent injections
        if (isInjecting) {
            console.log('[UserRatings] Already injecting, skipping');
            return;
        }
        
        // Get item ID from URL first
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
            injectionAttempts = 0;
            return;
        }
        
        // Check if UI already exists - if for same item, skip; if different item, remove it
        const existingUI = document.getElementById('user-ratings-ui');
        if (existingUI && currentItemId === itemId) {
            console.log('[UserRatings] UI already exists for this item, skipping');
            injectionAttempts = 0;
            return;
        }
        
        // If UI exists for different item, remove it
        if (existingUI && currentItemId !== itemId) {
            console.log('[UserRatings] Removing UI for previous item');
            existingUI.remove();
        }
        
        // Try multiple selector strategies to find the container
        let targetContainer = null;
        
        // Strategy 1: Look for .detailSection inside .detailPagePrimaryContent
        targetContainer = document.querySelector('.detailPagePrimaryContent .detailSection');
        
        // Strategy 2: Look for .detailPagePrimaryContent itself
        if (!targetContainer) {
            const primaryContent = document.querySelector('.detailPagePrimaryContent');
            if (primaryContent) {
                // Check if it has children (content loaded)
                if (primaryContent.children.length > 0) {
                    targetContainer = primaryContent;
                }
            }
        }
        
        // Strategy 3: Look for any detail section
        if (!targetContainer) {
            targetContainer = document.querySelector('.detailSection');
        }
        
        // Strategy 4: Look for itemDetailPage
        if (!targetContainer) {
            const detailPage = document.querySelector('.itemDetailPage .detailPageContent');
            if (detailPage) {
                targetContainer = detailPage;
            }
        }
        
        if (!targetContainer) {
            // If container not ready yet, retry with backoff
            if (injectionAttempts < maxInjectionAttempts) {
                injectionAttempts++;
                const retryDelay = Math.min(100 * Math.pow(1.5, injectionAttempts), 3000); // Better exponential backoff
                console.log(`[UserRatings] Container not ready, retry ${injectionAttempts}/${maxInjectionAttempts} in ${retryDelay.toFixed(0)}ms`);
                setTimeout(injectRatingsUI, retryDelay);
            } else {
                console.log('[UserRatings] Max injection attempts reached, attempting seamless refresh');
                
                // Try seamless refresh - only once per page load
                if (!hasTriedRefresh && itemId) {
                    hasTriedRefresh = true;
                    seamlessPageRefresh(itemId);
                } else {
                    injectionAttempts = 0;
                    isInjecting = false;
                }
            }
            return;
        }
        
        currentItemId = itemId;
        isInjecting = true;
        injectionAttempts = 0; // Reset counter on successful injection
        console.log('[UserRatings] Injecting UI for item:', itemId, 'into container:', targetContainer.className);
        
        // Create and inject UI at the end of target container
        createRatingsUI(itemId).then(ui => {
            targetContainer.appendChild(ui);
            
            // Function to check size and handle refresh
            const checkSizeAndRefresh = (checkName) => {
                const rect = ui.getBoundingClientRect();
                const hasZeroSize = rect.width === 0 && rect.height === 0;
                const hasZeroSizeFlag = ui.dataset.zeroSize === 'true';
                
                console.log(`[UserRatings] ${checkName} size check:`, rect.width, 'x', rect.height, hasZeroSize ? '(ZERO)' : '', hasZeroSizeFlag ? '(flagged)' : '');
                
                // Check if zero size or was flagged during creation
                if (hasZeroSize || hasZeroSizeFlag) {
                    // Final check always forces refresh
                    const isFinalCheck = checkName === 'Final';
                    
                    if (isFinalCheck) {
                        // For final check, clear all flags to allow refresh
                        console.log('[UserRatings] Final check detected zero size - forcing refresh');
                        hasTriedRefresh = false; // Allow refresh even if we tried before
                    }
                    
                    console.log('[UserRatings] UI has zero size, triggering refresh', isFinalCheck ? '(FORCED)' : '');
                    const injectedUI = document.getElementById('user-ratings-ui');
                    if (injectedUI) {
                        injectedUI.remove();
                    }
                    isInjecting = false;
                    hasTriedRefresh = false; // Allow refresh to be tried
                    seamlessPageRefresh(itemId, isFinalCheck); // Force if final check
                    return true; // Refresh triggered
                } else {
                    // Clear any zero size flag on success
                    delete ui.dataset.zeroSize;
                    return false; // No refresh needed
                }
            };
            
            // Immediate check (after DOM insertion)
            setTimeout(() => {
                if (!checkSizeAndRefresh('Immediate')) {
                    isInjecting = false;
                }
            }, 100);
            
            // Check after async operations should complete
            setTimeout(() => {
                if (!checkSizeAndRefresh('Post-async')) {
                    if (isInjecting) {
                        isInjecting = false;
                        hasTriedRefresh = false;
                        console.log('[UserRatings] ✓ UI injected successfully');
                    }
                }
            }, 800);
            
            // Final check after longer delay
            setTimeout(() => {
                checkSizeAndRefresh('Final');
            }, 1500);
            
        }).catch(err => {
            console.error('[UserRatings] Error creating UI:', err);
            isInjecting = false;
            injectionAttempts = 0; // Reset so it can try again
        });
    }

    // Monitor for UI that becomes zero-sized (page re-rendered)
    setInterval(() => {
        // Only check on details page
        const currentHash = window.location.hash;
        const isDetailsPage = currentHash.includes('#/details') || currentHash.includes('/details');
        if (!isDetailsPage) {
            return;
        }
        
        // Don't check if we just tried to refresh (prevent loops)
        if (hasTriedRefresh) {
            return;
        }
        
        const ui = document.getElementById('user-ratings-ui');
        if (ui && currentItemId) {
            const rect = ui.getBoundingClientRect();
            // Check if UI exists but has zero size (hidden or not rendered)
            if (rect.width === 0 && rect.height === 0) {
                // Check if parent container still exists and is visible
                const parent = ui.parentElement;
                if (parent) {
                    const parentRect = parent.getBoundingClientRect();
                    // If parent is visible but UI is not, trigger refresh
                    if (parentRect.width > 0 || parentRect.height > 0) {
                        console.log('[UserRatings] UI became zero-sized, parent visible, triggering refresh');
                        ui.remove();
                        isInjecting = false;
                        seamlessPageRefresh(currentItemId);
                    }
                }
            }
        }
    }, 2000); // Check every 2 seconds
    
    // Watch for page changes with more aggressive detection
    let lastUrl = location.href;
    let lastCheckedItemId = null;
    new MutationObserver((mutations) => {
        const url = location.href;
        
        // Check if URL changed
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
                ratingsTab.classList.remove('is-active');
                ratingsTab.style.display = 'none';
            }
            
            // Reset injection state (don't mark as navigating - let normal navigation proceed)
            isInjecting = false;
            injectionAttempts = 0;
            currentItemId = null;
            hasTriedRefresh = false; // Reset refresh flag for new page
            
            // Clear navigation flags immediately - don't block navigation
            isNavigating = false;
            lastNavigationTime = 0;
            
            // Try injection with slight delay
            setTimeout(injectRatingsUI, 150);
            return;
        }
        
        // Even if URL didn't change, check if detail page content appeared
        // This handles cases where the page loads but URL was already set
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) { // Element node
                    // Check if a detail page container was added
                    if (node.classList && (
                        node.classList.contains('detailPagePrimaryContent') ||
                        node.classList.contains('detailSection') ||
                        node.classList.contains('itemDetailPage')
                    )) {
                        console.log('[UserRatings] Detail page container detected, triggering injection');
                        isInjecting = false;
                        injectionAttempts = 0;
                        setTimeout(injectRatingsUI, 100);
                        return;
                    }
                    // Also check children
                    if (node.querySelector && (
                        node.querySelector('.detailPagePrimaryContent') ||
                        node.querySelector('.detailSection') ||
                        node.querySelector('.itemDetailPage')
                    )) {
                        console.log('[UserRatings] Detail page content detected in mutation, triggering injection');
                        isInjecting = false;
                        injectionAttempts = 0;
                        setTimeout(injectRatingsUI, 100);
                        return;
                    }
                }
            }
        }
    }).observe(document.body, { subtree: true, childList: true });

    // Initial injection - start with multiple attempts at different intervals
    setTimeout(injectRatingsUI, 100);
    setTimeout(injectRatingsUI, 300);
    setTimeout(injectRatingsUI, 600);
    
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
        
        // Reset injection state (don't mark as navigating - let normal navigation proceed)
        isInjecting = false;
        injectionAttempts = 0;
        currentItemId = null;
        hasTriedRefresh = false; // Reset refresh flag for new page
        
        // Clear navigation flags immediately - don't block navigation
        isNavigating = false;
        lastNavigationTime = 0;
        
        // Try injection with multiple attempts
        setTimeout(injectRatingsUI, 100);
        setTimeout(injectRatingsUI, 300);
    });

    // Function to display ratings list in the home page content area
    async function displayRatingsList() {
        // Find or create the ratings tab content container
        let ratingsTabContent = document.querySelector('#ratingsTab');
        
            if (!ratingsTabContent) {
                // Find the home page - this is the main page container
                const homePage = document.querySelector('[data-role="page"]:not(.hide)');
                
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
            }
        
        // Hide the home page and show ratings tab
        const homePage = document.querySelector('[data-role="page"]:not(.hide):not(#ratingsTab)');
        if (homePage) {
            homePage.classList.add('hide');
        }
        
        ratingsTabContent.classList.remove('hide');
        ratingsTabContent.style.display = 'block';
        ratingsTabContent.style.pointerEvents = 'auto';

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

            // Get plugin configuration
            let recentItemsLimit = 10;
            try {
                const pluginConfig = await ApiClient.getPluginConfiguration('b8c5d3e7-4f6a-8b9c-1d2e-3f4a5b6c7d8e');
                recentItemsLimit = pluginConfig.RecentlyRatedItemsCount || 10;
            } catch (error) {
                // Use default limit of 10
            }

            // Categorize items by type
            const movies = itemsWithDetails.filter(item => item.details.Type === 'Movie');
            const series = itemsWithDetails.filter(item => item.details.Type === 'Series');
            const episodes = itemsWithDetails.filter(item => item.details.Type === 'Episode');

            // Sort each category by most recently rated and limit to configured count
            const sortByRecent = (a, b) => (b.lastRatedTimestamp || 0) - (a.lastRatedTimestamp || 0);
            movies.sort(sortByRecent);
            series.sort(sortByRecent);
            episodes.sort(sortByRecent);
            
            // Slice to show only configured number of recent items
            const recentMovies = movies.slice(0, recentItemsLimit);
            const recentSeries = series.slice(0, recentItemsLimit);
            const recentEpisodes = episodes.slice(0, recentItemsLimit);

            // Function to build the ratings grid HTML for a category
            const buildCategoryGrid = (items) => items.map(item => {
                const details = item.details;
                
                // For episodes, use the series thumbnail instead
                const imageId = details.Type === 'Episode' && details.SeriesId ? details.SeriesId : item.itemId;
                const imageUrl = ApiClient.getImageUrl(imageId, {
                    type: 'Primary',
                    maxHeight: 400,
                    quality: 90
                });

                const title = details.Name || 'Unknown';
                const rating = item.averageRating.toFixed(1);
                const count = item.totalRatings;
                const serverId = ApiClient.serverId();

                return `
                    <div data-index="0" data-isfolder="false" data-serverid="${serverId}" data-id="${item.itemId}" data-type="${details.Type}" data-mediatype="Video" class="card portraitCard card-hoverable card-withuserdata" style="min-width: 150px; max-width: 250px;">
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
            
            if (recentMovies.length > 0) {
                sectionsHTML += `
                    <div class="verticalSection">
                        <div class="sectionTitleContainer sectionTitleContainer-cards padded-left">
                            <h2 class="sectionTitle sectionTitle-cards">Recently Rated Movies</h2>
                        </div>
                        <div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x" data-margin="0.9%">
                            ${buildCategoryGrid(recentMovies)}
                        </div>
                    </div>
                `;
            }
            
            if (recentSeries.length > 0) {
                sectionsHTML += `
                    <div class="verticalSection">
                        <div class="sectionTitleContainer sectionTitleContainer-cards padded-left">
                            <h2 class="sectionTitle sectionTitle-cards">Recently Rated Shows</h2>
                        </div>
                        <div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x" data-margin="0.9%">
                            ${buildCategoryGrid(recentSeries)}
                        </div>
                    </div>
                `;
            }
            
            if (recentEpisodes.length > 0) {
                sectionsHTML += `
                    <div class="verticalSection">
                        <div class="sectionTitleContainer sectionTitleContainer-cards padded-left">
                            <h2 class="sectionTitle sectionTitle-cards">Recently Rated Episodes</h2>
                        </div>
                        <div is="emby-itemscontainer" class="itemsContainer padded-left padded-right vertical-wrap focuscontainer-x" data-margin="0.9%">
                            ${buildCategoryGrid(recentEpisodes)}
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
                    case 'oldest':
                        allItems.sort((a, b) => (a.lastRatedTimestamp || 0) - (b.lastRatedTimestamp || 0));
                        break;
                    case 'title-asc':
                        allItems.sort((a, b) => (a.details.Name || '').localeCompare(b.details.Name || ''));
                        break;
                    case 'title-desc':
                        allItems.sort((a, b) => (b.details.Name || '').localeCompare(a.details.Name || ''));
                        break;
                    case 'count-desc':
                        allItems.sort((a, b) => b.totalRatings - a.totalRatings);
                        break;
                    case 'count-asc':
                        allItems.sort((a, b) => a.totalRatings - b.totalRatings);
                        break;
                }
                
                // Pagination
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const paginatedItems = allItems.slice(startIndex, endIndex);
                const totalPages = Math.ceil(allItems.length / itemsPerPage);
                
                const allItemsSection = document.querySelector('#allItemsSection');
                if (!allItemsSection) return;
                
                const startItem = startIndex + 1;
                const endItem = Math.min(endIndex, allItems.length);
                
                allItemsSection.innerHTML = `
                    <div class="verticalSection">
                        <div class="sectionTitleContainer sectionTitleContainer-cards padded-left">
                            <h2 class="sectionTitle sectionTitle-cards">All Rated Items</h2>
                        </div>
                        <div class="flex align-items-center justify-content-center flex-wrap-wrap padded-top padded-left padded-right padded-bottom focuscontainer-x" style="gap: 1em;">
                            <div class="paging">
                                <div class="listPaging">
                                    <span style="vertical-align:middle;">${startItem}-${endItem} of ${allItems.length}</span>
                                    <div style="display:inline-block;">
                                        <button is="paper-icon-button-light" id="prevPage" class="btnPreviousPage autoSize paper-icon-button-light" ${page === 1 ? 'disabled' : ''}>
                                            <span class="material-icons arrow_back" aria-hidden="true"></span>
                                        </button>
                                        <button is="paper-icon-button-light" id="nextPage" class="btnNextPage autoSize paper-icon-button-light" ${page === totalPages ? 'disabled' : ''}>
                                            <span class="material-icons arrow_forward" aria-hidden="true"></span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <select is="emby-select" id="sortSelect" class="emby-select-withcolor emby-select" style="width: auto;">
                                <option value="rating-desc" ${sortBy === 'rating-desc' ? 'selected' : ''}>Rating: High to Low</option>
                                <option value="rating-asc" ${sortBy === 'rating-asc' ? 'selected' : ''}>Rating: Low to High</option>
                                <option value="title-asc" ${sortBy === 'title-asc' ? 'selected' : ''}>Title: A-Z</option>
                                <option value="title-desc" ${sortBy === 'title-desc' ? 'selected' : ''}>Title: Z-A</option>
                                <option value="recent" ${sortBy === 'recent' ? 'selected' : ''}>Recently Rated</option>
                                <option value="oldest" ${sortBy === 'oldest' ? 'selected' : ''}>Oldest Rated</option>
                                <option value="count-desc" ${sortBy === 'count-desc' ? 'selected' : ''}>Most Ratings</option>
                                <option value="count-asc" ${sortBy === 'count-asc' ? 'selected' : ''}>Least Ratings</option>
                            </select>
                        </div>
                        <div is="emby-itemscontainer" class="itemsContainer vertical-wrap padded-left padded-right">
                            ${buildCategoryGrid(paginatedItems)}
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
            
            // Check if tab already exists
            const existingTab = document.querySelector('[data-ratings-tab="true"]');
            if (existingTab) {
                return;
            }

            // Try to find the tabs container by locating the Home button first
            const homeButton = Array.from(document.querySelectorAll('.emby-tab-button')).find(btn => 
                btn.textContent.trim().toLowerCase().includes('home')
            );
            
            let tabsSlider = null;
            
            if (homeButton) {
                tabsSlider = homeButton.parentElement;
            } else {
                // Strategy 2: Look for .emby-tabs-slider
                tabsSlider = document.querySelector('.emby-tabs-slider');
            }
            
            if (!tabsSlider) {
                return;
            }

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
            
            // Remove active class from all tabs
            tabsSlider.querySelectorAll('.emby-tab-button').forEach(tab => {
                tab.classList.remove('emby-tab-button-active');
            });
            
            // Add active class to this tab
            ratingsTab.classList.add('emby-tab-button-active');
            
            try {
                // Load and display ratings list in the home page
                await displayRatingsList();
            } catch (error) {
                console.error('[UserRatings] Error in displayRatingsList:', error);
            }
        });

        // Add listeners to other tabs to properly switch content
        const otherTabs = tabsSlider.querySelectorAll('.emby-tab-button:not([data-ratings-tab="true"])');
        otherTabs.forEach((tab, index) => {
            tab.addEventListener('click', function(e) {
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
                }
            }, true); // Use capture to run before Jellyfin's handler
        });

            // Insert the tab
            tabsSlider.appendChild(ratingsTab);
            
        } catch (error) {
            console.error('[UserRatings] Tab injection error:', error);
        }
    }

    // Try to inject tab on page load and navigation
    function checkAndInjectTab() {
        injectRatingsTab();
    }

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
})();