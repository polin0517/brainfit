import { useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import axios from 'axios';

import './Upload.scss';
import uploadGif from '../../assets/images/upload.gif';

const SERVER_URL = process.env.REACT_APP_SERVER_URL;
const EXERCISES_URL = `${SERVER_URL}/exercises`;
const IMAGES_URL = `${SERVER_URL}/exercises/images`;

const Upload = (props) => {
	const { user } = props;
	const { prevLocation } = props.match.params;
	const [file, setFile] = useState(null);
	const [progress, setProgress] = useState(0);
	const progressContainer = useRef();
	const fileInput = useRef();
	const errorRefs = { file: useRef(), title: useRef() };
	const buttonRefs = { upload: useRef(), cancel: useRef(), done: useRef() };
	const history = useHistory();

	const handleFile = (e) => {
		errorRefs.file.current.style.visibility = 'hidden';
		const files = e.target.files;

		if(files[0] && files[0].type !== "image/gif"){
			errorRefs.file.current.style.visibility = "visible";
			setFile(null);
			fileInput.current.value = '';
			return;
		}

		setProgress(0);
		setFile(files[0]);
	}

	const handleUpload = (e) => {
		e.preventDefault();
		errorRefs.title.current.style.visibility = 'hidden';
		errorRefs.file.current.style.visibility = 'hidden';

		const { title, description, equipment } = e.target;

		if(!title.value || !file){
			!title.value && (errorRefs.title.current.style.visibility = 'visible');
			!file && (errorRefs.file.current.style.visibility = 'visible');
			return;
		}

		errorRefs.title.current.style.visibility = 'hidden';
		buttonRefs.upload.current.style.visibility = 'hidden';
		buttonRefs.cancel.current.style.visibility = 'hidden';
		progressContainer.current.style.visibility = 'visible';

		const formData = new FormData();
		formData.append('file', file);

		axios.post(IMAGES_URL, formData, {
			onUploadProgress: (ProgressEvent) =>  {
				let progress = Math.round(ProgressEvent.loaded / ProgressEvent.total * 100).toString() + '%';
				setProgress(progress);
			}
		})
		.then(res => {
			const filename = JSON.parse(res.data).filename;
			
			const data = {
				filename: filename,
				creatorId: user.id,
				title: title.value,
				description: description.value,
				equipment: equipment.value,
				likes: 0
			};

			return axios.post(EXERCISES_URL, data);
		})
		.then(res => {
			buttonRefs.done.current.style.visibility = 'visible';
		})
		.catch(err => {
			console.log("There was an error creating exercise and uploading file. Error :", err);
		});
	}

	const handleCancel = (e) => {
		e.preventDefault();

		history.push(`/${prevLocation}`);
	}

	return(
		<div className="upload">
			<section className="upload__upload-gif-section">
				<img src={uploadGif} alt="animated gif of guy cycling"/>
			</section>
			<section className="upload__upload-section">
				<form className="upload__form" onSubmit={handleUpload}>

					<label htmlFor="image">exercise gif: 
						<input 
							className="upload__choose-file"
							id="image"
							name="image"
							accept=".gif"
							onChange={handleFile}
							ref={fileInput}
							type="file">
						</input>
						<p className="upload__choose-file-error" ref={errorRefs.file}>must select a gif image</p>
					</label>

					<label htmlFor="title">title:
						<input 
							id="title" 
							name="title" 
							type="text" 
							maxLength="255"
							placeholder="exercise title">
						</input>
						<p className="upload__exercise-title-error" ref={errorRefs.title}>must provide a title</p>
					</label>

					<label htmlFor="description"> exercise description:
						<textarea 
							id="description" 
							name="description" 
							className="upload__exercise-description"
							maxLength="255"
							placeholder="exercise description">
						</textarea>
					</label>

					<label htmlFor="equipment"> equipment:
						<select name="equipment" id="equipment" className="upload__equipment-select">
							<option value="none">none</option>
							<option value="dumbbells">dumbbells</option>
							<option value="barbell">barbell</option>
							<option value="kettleBell">kettle bell</option>
						</select>
					</label>
					<div className="upload__button-row">
						<button className="upload__button" onClick={handleCancel} ref={buttonRefs.cancel}>cancel</button>
						<button type="submit" className="upload__button" ref={buttonRefs.upload}>upload</button>
					</div>
				</form>			
				<div className="upload__progress" ref={progressContainer}>
					<div className="upload__progress-bar" style={{ width: progress}}>
					</div>
				</div>
				<Link to='/exercises' className="upload__done-button" ref={buttonRefs.done}>done</Link>
			</section>
		</div>
	);
}

export default Upload;
