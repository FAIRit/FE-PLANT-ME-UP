import React, { Component } from "react";
import { firebase, storage } from "../firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export class ImageUpload extends Component {
  constructor(props) {
    super(props);

    this.state = {
      image: null,
      url: "",
      progress: 0,
      textarea: "",
      images: [],
      file: null,
    };
  }

  handleAddImage = (e) => {
    const image = e.target.files[0];
    if (!image) {
      return;
    }
    const imageName = image.name;
    this.setState({
      image,
      imageName,
      file: URL.createObjectURL(image),
    });
  };

  handleRemovePreview = () => {
    this.setState({
      imageName: null,
      file: null,
    });
  };

  handleImgDescription = (e) => {
    this.setState({
      textarea: e.target.value,
    });
  };

  handleUpload = () => {
    const user = firebase.auth().currentUser;
    const { image } = this.state;
    const { imageName } = this.state;
    const { plantId } = this.props;
    const uploadTask = storage
      .ref("images")
      .child(user.uid)
      .child(plantId)
      .child(imageName)
      .put(image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // progress function ....
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        this.setState({ progress });
      },
      (error) => {
        // error function ....
        console.log(error);
      },
      () => {
        storage
          .ref("images")
          .child(user.uid)
          .child(plantId)
          .child(imageName)
          .getDownloadURL()
          .then((url) => {
            const user = firebase.auth().currentUser;
            const plantRef = firebase
              .database()
              .ref("plants")
              .child(user.uid)
              .child(plantId);
            const imagesRef = plantRef.child("images");

            const image = {
              url: url,
              description: this.state.textarea,
            };

            plantRef.update({ profileImage: image });
            imagesRef.push(image);

            this.setState({
              url,
              textarea: "",
              image: null,
              progress: 0,
              imageName: null,
              file: null,
            });
          });
      }
    );
  };

  render() {
    return (
      <div className="c-image-upload">
        <div className="c-image-upload--form">
          <div
            className={
              this.state.file
                ? "c-image-upload--preview c-image-upload--zone"
                : "c-image-upload--zone"
            }
          >
            {this.state.file ? (
              <div
                style={{
                  position: "relative",
                  backgroundImage: `url(${this.state.file})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  width: 100,
                  height: 100,
                }}
              >
                <button
                  className="btn--remove btn--remove-preview"
                  onClick={this.handleRemovePreview}
                >
                  <FontAwesomeIcon icon="times-circle" />
                </button>
              </div>
            ) : (
              <FontAwesomeIcon
                className="upload-plus-circle"
                icon="plus-circle"
              />
            )}

            <input
              ref={this.fileInput}
              id="c-image-upload-input"
              type="file"
              onChange={this.handleAddImage}
            />
          </div>
          <div className="upload-file-name">
            {this.state.imageName || (
              <p>Kliknij, aby dodać plik ze zdjęciem.</p>
            )}
          </div>
        </div>
        <div>
          <textarea
            type="textarea"
            name="textarea"
            className="input--textarea"
            placeholder="wpisz opis zdjęcia"
            onChange={this.handleImgDescription}
            value={this.state.textarea}
            rows={2}
            cols={30}
          />
        </div>
        <br />
        <progress
          value={this.state.progress}
          max="100"
          className={
            this.state.progress === 0 ? "progress-bar--hid" : "progress-bar"
          }
        />
        <br />
        <button onClick={this.handleUpload} className="btn">
          dodaj
        </button>
      </div>
    );
  }
}
