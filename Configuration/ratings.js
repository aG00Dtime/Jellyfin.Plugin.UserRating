(function() {
    'use strict';

    console.log('[UserRatings] Loading plugin...');

    // CSS for star ratings
    const style = document.createElement('style');
    style.textContent = `
        .user-ratings-container {
            margin: 1.5em 0;
            padding: 1em;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
        }
        .user-ratings-title {
            font-size: 1.2em;
            margin-bottom: 0.5em;
            font-weight: 500;
        }
        .star-rating {
            display: inline-flex;
            gap: 0.25em;
            cursor: pointer;
            font-size: 2em;
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
            margin-top: 0.5em;
        }
        .rating-note input {
            width: 100%;
            padding: 0.5em;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: white;
        }
        .rating-actions {
            margin-top: 0.5em;
            display: flex;
            gap: 0.5em;
        }
        .rating-actions button {
            padding: 0.5em 1em;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
        }
        .rating-actions .save-btn {
            background: #00a4dc;
            color: white;
        }
        .rating-actions .delete-btn {
            background: #e53935;
            color: white;
        }
        .other-ratings {
            margin-top: 1em;
            padding-top: 1em;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .other-ratings-title {
            font-size: 1em;
            margin-bottom: 0.5em;
            opacity: 0.8;
        }
        .rating-item {
            margin: 0.5em 0;
            padding: 0.5em;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
        }
        .rating-item-user {
            font-weight: 500;
        }
        .rating-item-stars {
            color: #ffd700;
            margin-left: 0.5em;
        }
        .rating-item-note {
            margin-top: 0.25em;
            opacity: 0.8;
            font-size: 0.9em;
        }
        .rating-average {
            display: inline-block;
            margin-left: 1em;
            font-size: 1.2em;
            color: #ffd700;
        }
    `;
    document.head.appendChild(style);

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
            const response = await fetch(ApiClient.getUrl(`UserRatings/Item/${itemId}`), {
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            const data = await response.json();
            return data.ratings || [];
        } catch (error) {
            console.error('[UserRatings] Error loading ratings:', error);
            return [];
        }
    }

    async function loadMyRating(itemId) {
        try {
            const response = await fetch(ApiClient.getUrl(`UserRatings/MyRating/${itemId}`), {
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
            const url = ApiClient.getUrl(`UserRatings/Rate?itemId=${itemId}&rating=${rating}${note ? '&note=' + encodeURIComponent(note) : ''}`);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-Emby-Token': ApiClient.accessToken()
                }
            });
            return await response.json();
        } catch (error) {
            console.error('[UserRatings] Error saving rating:', error);
            return { success: false, message: error.message };
        }
    }

    async function deleteRating(itemId) {
        try {
            const url = ApiClient.getUrl(`UserRatings/Rating?itemId=${itemId}`);
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

    function createRatingUI(itemId) {
        const container = document.createElement('div');
        container.className = 'user-ratings-container';
        
        const title = document.createElement('div');
        title.className = 'user-ratings-title';
        title.textContent = 'Your Rating';
        container.appendChild(title);

        let currentRating = 0;
        let currentNote = '';
        
        const starContainer = createStarRating(0, true, 
            (rating) => updateStarDisplay(starContainer, rating),
            (rating) => {
                currentRating = rating;
                updateStarDisplay(starContainer, rating);
            }
        );
        container.appendChild(starContainer);

        const noteContainer = document.createElement('div');
        noteContainer.className = 'rating-note';
        const noteInput = document.createElement('input');
        noteInput.type = 'text';
        noteInput.placeholder = 'Add a note (optional)';
        noteInput.addEventListener('input', (e) => {
            currentNote = e.target.value;
        });
        noteContainer.appendChild(noteInput);
        container.appendChild(noteContainer);

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
            
            const result = await saveRating(itemId, currentRating, currentNote);
            
            if (result.success) {
                saveBtn.textContent = 'Saved!';
                setTimeout(() => {
                    saveBtn.textContent = 'Save Rating';
                    saveBtn.disabled = false;
                }, 2000);
                
                // Reload other ratings
                loadAndDisplayOtherRatings(itemId, container);
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
                currentNote = '';
                noteInput.value = '';
                updateStarDisplay(starContainer, 0);
                deleteBtn.style.display = 'none';
                
                // Reload other ratings
                loadAndDisplayOtherRatings(itemId, container);
            } else {
                alert('Error deleting rating: ' + result.message);
            }
            
            deleteBtn.textContent = 'Delete Rating';
            deleteBtn.disabled = false;
        });
        actionsContainer.appendChild(deleteBtn);
        
        container.appendChild(actionsContainer);

        // Load existing rating
        loadMyRating(itemId).then(data => {
            if (data && data.rating) {
                currentRating = data.rating;
                currentNote = data.note || '';
                noteInput.value = currentNote;
                updateStarDisplay(starContainer, currentRating);
                deleteBtn.style.display = 'inline-block';
            }
        });

        // Load other users' ratings
        loadAndDisplayOtherRatings(itemId, container);

        return container;
    }

    async function loadAndDisplayOtherRatings(itemId, container) {
        // Remove existing other ratings section
        const existingSection = container.querySelector('.other-ratings');
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
        
        // Calculate average
        const average = ratings.reduce((sum, r) => sum + r.Rating, 0) / ratings.length;
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
            userName.textContent = rating.UserName;
            userLine.appendChild(userName);
            
            const stars = document.createElement('span');
            stars.className = 'rating-item-stars';
            stars.textContent = '★'.repeat(rating.Rating) + '☆'.repeat(5 - rating.Rating);
            userLine.appendChild(stars);
            
            item.appendChild(userLine);
            
            if (rating.Note) {
                const note = document.createElement('div');
                note.className = 'rating-item-note';
                note.textContent = rating.Note;
                item.appendChild(note);
            }
            
            otherRatings.appendChild(item);
        });
        
        container.appendChild(otherRatings);
    }

    function injectRatingUI() {
        // Check if we're on an item detail page
        const itemId = ApiClient.getCurrentItemId?.() || window.location.pathname.match(/\/details\?id=([a-f0-9-]+)/)?.[1];
        
        if (!itemId) {
            return;
        }

        // Check if already injected
        if (document.querySelector('.user-ratings-container')) {
            return;
        }

        // Find a good place to inject the UI
        // Try to find the item details sections
        const detailsPage = document.querySelector('.detailsPage, .itemDetailsPage, .detailPagePrimaryContainer');
        
        if (detailsPage) {
            const ratingUI = createRatingUI(itemId);
            
            // Try to find the overview section to insert after it
            const overview = detailsPage.querySelector('.overview, .itemOverview, .detailsSection');
            if (overview) {
                overview.parentNode.insertBefore(ratingUI, overview.nextSibling);
            } else {
                // Fall back to prepending to the details page
                detailsPage.insertBefore(ratingUI, detailsPage.firstChild);
            }
            
            console.log('[UserRatings] Injected rating UI for item:', itemId);
        }
    }

    // Watch for page changes
    function observePageChanges() {
        // Try to inject immediately
        setTimeout(injectRatingUI, 500);
        
        // Watch for navigation changes
        const observer = new MutationObserver((mutations) => {
            const hasNewContent = mutations.some(m => 
                Array.from(m.addedNodes).some(node => 
                    node.nodeType === 1 && (
                        node.classList?.contains('detailsPage') ||
                        node.classList?.contains('itemDetailsPage') ||
                        node.querySelector?.('.detailsPage, .itemDetailsPage')
                    )
                )
            );
            
            if (hasNewContent) {
                setTimeout(injectRatingUI, 100);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Wait for page to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', observePageChanges);
    } else {
        observePageChanges();
    }

    console.log('[UserRatings] Plugin initialized');
})();

