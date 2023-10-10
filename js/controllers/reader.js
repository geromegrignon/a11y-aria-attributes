import { HORIZONTAL_SLIDES_SELECTOR, SLIDES_SELECTOR } from '../utils/constants.js'
import { queryAll, createStyleSheet } from '../utils/util.js'

/**
 * The reader mode lets you read a reveal.js presentation
 * as a linear scrollable page.
 */
export default class Reader {

	constructor( Reveal ) {

		this.Reveal = Reveal;

		this.active = false;
		this.activatedCallbacks = [];

		this.onScroll = this.onScroll.bind( this );

	}

	/**
	 * Activates the reader mode. This rearranges the presentation DOM
	 * by—among other things—wrapping each slide in a page element.
	 */
	activate() {

		if( this.active ) return;

		const state = this.Reveal.getState();

		this.active = true;

		this.slideHTMLBeforeActivation = this.Reveal.getSlidesElement().innerHTML;

		const horizontalSlides = queryAll( this.Reveal.getRevealElement(), HORIZONTAL_SLIDES_SELECTOR );

		this.viewportElement.classList.add( 'loading-scroll-mode', 'reveal-reader' );
		this.viewportElement.addEventListener( 'scroll', this.onScroll );

		let presentationBackground;

		const viewportStyles = window.getComputedStyle( this.viewportElement );
		if( viewportStyles && viewportStyles.background ) {
			presentationBackground = viewportStyles.background;
		}

		const pageElements = [];
		const pageContainer = horizontalSlides[0].parentNode;

		function createPage( slide, h, v ) {

			// Wrap the slide in a page element and hide its overflow
			// so that no page ever flows onto another
			const page = document.createElement( 'div' );
			page.className = 'reader-page';
			pageElements.push( page );

			// Copy the presentation-wide background to each page
			if( presentationBackground ) {
				page.style.background = presentationBackground;
			}

			const stickyContainer = document.createElement( 'div' );
			stickyContainer.className = 'reader-page-sticky';
			page.appendChild( stickyContainer );

			const contentContainer = document.createElement( 'div' );
			contentContainer.className = 'reader-page-content';
			stickyContainer.appendChild( contentContainer );

			contentContainer.appendChild( slide );

			slide.classList.remove( 'past', 'future' );

			if( typeof h === 'number' ) slide.setAttribute( 'data-index-h', h );
			if( typeof v === 'number' ) slide.setAttribute( 'data-index-v', v );

			if( slide.slideBackgroundElement ) {
				slide.slideBackgroundElement.remove( 'past', 'future' );
				contentContainer.insertBefore( slide.slideBackgroundElement, slide );
			}

		}

		// Slide and slide background layout
		horizontalSlides.forEach( ( horizontalSlide, h ) => {

			if( this.Reveal.isVerticalStack( horizontalSlide ) ) {
				horizontalSlide.querySelectorAll( 'section' ).forEach( ( verticalSlide, v ) => {
					createPage( verticalSlide, h, v );
				});
			}
			else {
				createPage( horizontalSlide, h, 0 );
			}

		}, this );

		this.createProgressBar();

		// Remove leftover stacks
		queryAll( this.Reveal.getRevealElement(), '.stack' ).forEach( stack => stack.remove() );

		pageElements.forEach( page => pageContainer.appendChild( page ) );

		// Re-run JS-based content layout after the slide is added to page DOM
		this.Reveal.slideContent.layout( this.Reveal.getSlidesElement() );

		this.Reveal.layout();
		this.Reveal.setState( state );

		this.viewportElement.classList.remove( 'loading-scroll-mode' );

		this.activatedCallbacks.forEach( callback => callback() );
		this.activatedCallbacks = [];

	}

	createProgressBar() {

		this.progressBar = document.createElement( 'div' );
		this.progressBar.className = 'reader-progress';

		this.progressBarInner = document.createElement( 'div' );
		this.progressBarInner.className = 'reader-progress-inner';
		this.progressBar.appendChild( this.progressBarInner );

		this.progressBarPlayhead = document.createElement( 'div' );
		this.progressBarPlayhead.className = 'reader-progress-playhead';
		this.progressBarInner.appendChild( this.progressBarPlayhead );

		this.viewportElement.insertBefore( this.progressBar, this.viewportElement.firstChild );

		const handleMouseDown = ( event ) => {

			event.preventDefault();

			document.addEventListener( 'mousemove', handleDocumentMouseMove );
			document.addEventListener( 'mouseup', handleDocumentMouseUp );

			handleDocumentMouseMove( event );

		};

		const handleDocumentMouseMove	= ( event ) => {

			let progress = Math.max( Math.min( ( event.clientY - this.progressBarInner.getBoundingClientRect().top ) / this.progressBarHeight, 1 ), 0 );
			progress = Math.max( Math.min( progress, 1 ), 0 );

			this.viewportElement.scrollTop = progress * ( this.viewportElement.scrollHeight - this.viewportElement.offsetHeight );

		};

		const handleDocumentMouseUp = ( event ) => {

			document.removeEventListener( 'mousemove', handleDocumentMouseMove );
			document.removeEventListener( 'mouseup', handleDocumentMouseUp );

		};

		this.progressBarInner.addEventListener( 'mousedown', handleMouseDown );

	}

	/**
	 * Deactivates the reader mode and restores the standard slide-based
	 * presentation.
	 */
	deactivate() {

		if( !this.active ) return;

		const state = this.Reveal.getState();

		this.active = false;

		this.viewportElement.removeEventListener( 'scroll', this.onScroll );
		this.viewportElement.classList.remove( 'reveal-reader' );

		this.progressBar.remove();

		this.Reveal.getSlidesElement().innerHTML = this.slideHTMLBeforeActivation;
		this.Reveal.sync();

		this.Reveal.setState( state );

	}

	toggle( override ) {

		if( typeof override === 'boolean' ) {
			override ? this.activate() : this.deactivate();
		}
		else {
			this.isActive() ? this.deactivate() : this.activate();
		}

	}

	/**
	 * Checks if the reader mode is currently active.
	 */
	isActive() {

		return this.active;

	}

	/**
	 * Retrieve a slide by its original h/v index (i.e. the indices the
	 * slide had before being linearized).
	 *
	 * @param {number} h
	 * @param {number} v
	 * @returns {HTMLElement}
	 */
	getSlideByIndices( h, v ) {

		const page = this.pages.find( page => page.indexh === h && page.indexv === v );

		return page ? page.slideElement : null;

	}

	/**
	 * Updates our reader pages to match the latest configuration and
	 * presentation size.
	 */
	sync() {

		const config = this.Reveal.getConfig();

		const slideSize = this.Reveal.getComputedSlideSize( window.innerWidth, window.innerHeight );
		const scale = this.Reveal.getScale();
		const readerLayout = config.readerLayout;

		const viewportHeight = this.viewportElement.offsetHeight;
		const compactHeight = slideSize.height * scale;
		const pageHeight = readerLayout === 'full' ? viewportHeight : compactHeight;

		// The height that needs to be scrolled between scroll triggers
		const scrollTriggerHeight = viewportHeight;

		this.viewportElement.style.setProperty( '--page-height', pageHeight + 'px' );
		this.viewportElement.style.scrollSnapType = typeof config.readerScrollSnap === 'string' ?
												`y ${config.readerScrollSnap}` : '';

		const pageElements = Array.from( this.Reveal.getRevealElement().querySelectorAll( '.reader-page' ) );

		this.pages = pageElements.map( pageElement => {
			const page = {
				pageElement: pageElement,
				stickyElement: pageElement.querySelector( '.reader-page-sticky' ),
				slideElement: pageElement.querySelector( 'section' ),
				backgroundElement: pageElement.querySelector( '.slide-background' ),
				top: pageElement.offsetTop,
				scrollTriggers: [],
			};

			page.indexh = parseInt( page.slideElement.getAttribute( 'data-index-h' ), 10 );
			page.indexv = parseInt( page.slideElement.getAttribute( 'data-index-v' ), 10 );

			page.slideElement.style.width = slideSize.width + 'px';
			page.slideElement.style.height = config.center === true ? '' : slideSize.height + 'px';

			// Each fragment 'group' is an array containing one or more
			// fragments. Multiple fragments that appear at the same time
			// are part of the same group.
			page.fragments = this.Reveal.fragments.sort( pageElement.querySelectorAll( '.fragment:not(.disabled)' ) );
			page.fragmentGroups = this.Reveal.fragments.sort( pageElement.querySelectorAll( '.fragment' ), true );

			// Create scroll triggers that show/hide fragments
			if( page.fragmentGroups.length ) {
				const segmentSize = 1 / ( page.fragmentGroups.length + 1 );
				page.scrollTriggers.push(
					// Trigger for the initial state with no fragments visible
					{ range: [ 0, segmentSize ], fragmentIndex: -1 },

					// Triggers for each fragment group
					...page.fragmentGroups.map( ( fragments, i ) => ({
						range: [ segmentSize * ( i + 1 ), segmentSize * ( i + 2 ) ],
						fragmentIndex: i
					}))
				);
			}

			// Add scroll padding based on how many scroll triggers we have
			page.scrollPadding = scrollTriggerHeight * page.scrollTriggers.length;

			// In the compact layout, only slides with scroll triggers cover the
			// full viewport height. This helps avoid empty gaps before or after
			// a sticky slide.
			if( readerLayout === 'compact' && page.scrollTriggers.length > 0 ) {
				page.pageHeight = viewportHeight;
				page.pageElement.style.setProperty( '--page-height', viewportHeight + 'px' );
			}
			else {
				page.pageHeight = pageHeight;
				page.pageElement.style.removeProperty( '--page-height' );
			}

			page.pageElement.style.scrollSnapAlign = page.pageHeight < viewportHeight ? 'center' : 'start';

			// This variable is used to pad the height of our page in CSS
			page.pageElement.style.setProperty( '--page-scroll-padding', page.scrollPadding + 'px' );

			// The total height including scrollable space
			page.totalHeight = page.pageHeight + page.scrollPadding;

			page.bottom = page.top + page.totalHeight;

			// If this is a sticky page, stick it to the vertical center
			if( page.scrollTriggers.length > 0 ) {
				page.stickyElement.style.position = 'sticky';
				page.stickyElement.style.top = Math.max( ( viewportHeight - page.pageHeight ) / 2, 0 ) + 'px';

				// Make this page freeze at the vertical center of the viewport
				page.top -= ( viewportHeight - page.pageHeight ) / 2;
			}
			else {
				page.stickyElement.style.position = 'relative';
			}

			return page;
		} );

		this.createProgressBarSlides();

	}

	createProgressBarSlides() {

		this.progressBarInner.querySelectorAll( '.reader-progress-slide' ).forEach( slide => slide.remove() );

		const spacing = 4;

		const viewportHeight = this.viewportElement.offsetHeight;
		const scrollHeight = this.viewportElement.scrollHeight;

		this.progressBarHeight = this.progressBarInner.offsetHeight;
		this.playheadHeight = viewportHeight / scrollHeight * this.progressBarHeight;
		this.progressBarScrollableHeight = this.progressBarHeight - this.playheadHeight;

		this.progressBarPlayhead.style.height = this.playheadHeight - spacing + 'px';

		this.pages.forEach( page => {

			page.progressBarSlide = document.createElement( 'div' );
			page.progressBarSlide.className = 'reader-progress-slide';
			page.progressBarSlide.classList.toggle( 'has-triggers', page.scrollTriggers.length > 0 );
			page.progressBarSlide.style.top = page.top / scrollHeight * this.progressBarHeight + 'px';
			page.progressBarSlide.style.height = page.totalHeight / scrollHeight * this.progressBarHeight - spacing + 'px';
			this.progressBarInner.appendChild( page.progressBarSlide );

			page.scrollTriggers.forEach( trigger => {

				const triggerElement = document.createElement( 'div' );
				triggerElement.className = 'reader-progress-trigger';
				triggerElement.style.top = trigger.range[0] * page.totalHeight / scrollHeight * this.progressBarHeight + 'px';
				triggerElement.style.height = ( trigger.range[1] - trigger.range[0] ) * page.totalHeight / scrollHeight * this.progressBarHeight - spacing + 'px';
				page.progressBarSlide.appendChild( triggerElement );

			} );

		} );

	}

	layout() {

		if( this.isActive() ) {
			this.sync();
			this.onScroll();
		}

	}

	moveProgressBarTo( progress ) {

		this.progressBarPlayhead.style.transform = `translateY(${progress * this.progressBarScrollableHeight}px)`;

		this.pages.forEach( ( page ) => {
			page.progressBarSlide.classList.toggle( 'active', !!page.active );
		} );

	}

	scrollToSlide( slideElement ) {

		if( !this.active ) {
			this.activatedCallbacks.push( () => this.scrollToSlide( slideElement ) );
		}
		else {
			slideElement.parentNode.scrollIntoView();
		}

	}

	onScroll() {

		const viewportHeight = this.viewportElement.offsetHeight;
		const scrollTop = this.viewportElement.scrollTop;

		// Find the page closest to the center of the viewport, this
		// is the page we want to focus and activate
		const activePage = this.pages.reduce( ( closestPage, page ) => {
			// For tall pages with multiple scroll triggers we need to
			// check the distnace from both the top of the page and the
			// bottom
			const distance = Math.min(
				Math.abs( ( page.top + page.pageHeight / 2 ) - scrollTop - viewportHeight / 2 ),
				Math.abs( ( page.top + ( page.totalHeight - page.pageHeight / 2 ) ) - scrollTop - viewportHeight / 2 )
			);
			return distance < closestPage.distance ? { page, distance } : closestPage;
		}, { page: this.pages[0], distance: Infinity } ).page;

		this.pages.forEach( ( page, pageIndex ) => {
			const isWithinPreloadRange = scrollTop + viewportHeight >= page.top - viewportHeight && scrollTop < page.top + page.bottom + viewportHeight;
			const isPartiallyVisible = scrollTop + viewportHeight >= page.top && scrollTop < page.top + page.bottom;

			// Preload content when it appears within range
			if( isWithinPreloadRange ) {
				if( !page.preloaded ) {
					page.preloaded = true;
					this.Reveal.slideContent.load( page.slideElement );
				}
			}
			else if( page.preloaded ) {
				page.preloaded = false;
				this.Reveal.slideContent.unload( page.slideElement );
			}

			// Activate the current page — there can only be one active page at
			// a time.
			if( page === activePage ) {
				if( !page.active ) {
					page.active = true;
					page.pageElement.classList.add( 'present' );
					page.slideElement.classList.add( 'present' );

					this.Reveal.setCurrentReaderPage( page.pageElement, page.indexh, page.indexv );
					this.Reveal.slideContent.startEmbeddedContent( page.slideElement );

					if( page.backgroundElement ) {
						this.Reveal.slideContent.startEmbeddedContent( page.backgroundElement );
					}
				}
			}
			// Deactivate previously active pages
			else if( page.active ) {
				page.active = false;
				page.pageElement.classList.remove( 'present' );
				page.slideElement.classList.remove( 'present' );
				this.Reveal.slideContent.stopEmbeddedContent( page.slideElement );

				if( page.backgroundElement ) {
					this.Reveal.slideContent.stopEmbeddedContent( page.backgroundElement );
				}
			}

			// Handle scroll freezing and triggers for slides in view
			if( isPartiallyVisible && page.totalHeight > page.pageHeight ) {
				let scrollProgress = ( scrollTop - page.top ) / page.scrollPadding;
				scrollProgress = Math.max( Math.min( scrollProgress, 1 ), 0 );

				page.scrollTriggers.forEach( trigger => {
					if( scrollProgress >= trigger.range[0] && scrollProgress < trigger.range[1] ) {
						if( !trigger.active ) {
							trigger.active = true;
							this.Reveal.fragments.update( trigger.fragmentIndex, page.fragments, page.slideElement );
						}
					}
					else {
						trigger.active = false;
					}
				} );
			}
		} );

		this.moveProgressBarTo( scrollTop / ( this.viewportElement.scrollHeight - viewportHeight ) );

	}

	get viewportElement() {

		return this.Reveal.getViewportElement();

	}

}
