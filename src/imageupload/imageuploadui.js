/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/videoUpload/videoUploadui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileDialogButtonView from '@ckeditor/ckeditor5-upload/src/ui/filedialogbuttonview';
import imageIcon from '@ckeditor/ckeditor5-core/theme/icons/image.svg';
import { createImageTypeRegExp } from './utils';

/**
 * The image upload button plugin.
 *
 * For a detailed overview, check the {@glink features/image-upload/image-upload Image upload feature} documentation.
 *
 * Adds the `'videoUpload'` button to the {@link module:ui/componentfactory~ComponentFactory UI component factory}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class VideoUploadUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		// Setup `videoUpload` button.
		editor.ui.componentFactory.add( 'videoUpload', locale => {
			const view = new FileDialogButtonView( locale );
			const command = editor.commands.get( 'videoUpload' );
			const imageTypes = editor.config.get( 'image.upload.types' );
			const imageTypesRegExp = createImageTypeRegExp( imageTypes );

			view.set( {
				acceptedType: imageTypes.map( type => `image/${ type }` ).join( ',' ),
				allowMultipleFiles: true
			} );

			view.buttonView.set( {
				label: t( 'Insert image' ),
				icon: imageIcon,
				tooltip: true
			} );

			view.buttonView.bind( 'isEnabled' ).to( command );

			view.on( 'done', ( evt, files ) => {
				const imagesToUpload = Array.from( files ).filter( file => imageTypesRegExp.test( file.type ) );

				if ( imagesToUpload.length ) {
					editor.execute( 'videoUpload', { file: imagesToUpload } );
				}
			} );

			return view;
		} );
	}
}
