# Temp-Image-Holder

Temp-Image-Holder is a simple Node.js application for uploading and temporarily storing compressed images. The application uses HTTPS and generates short, unique IDs for each uploaded image.

## Features

- Secure connection using HTTPS and SSL
- Short, unique IDs for accessing images
- Simple and responsive UI for uploading images
- Images stored in compressed form
- Original image gets deleted after the compressed image is made
- Images are automatically deleted after 10 minutes
- Configurable settings in `config.json`

## Prerequisites

- Node.js
- npm

## Installation

1. Clone the repository:

```
git clone https://github.com/CitroenGames/Temp-Image-Holder.git
```

2. Navigate to the project directory:

```
cd Temp-Image-Holder
```

3. Install the required dependencies:

```
npm install
```

4. Create the required directories for storing uploaded and compressed images:

```
mkdir uploads
mkdir compressed
```

5. Add your SSL certificate, private key, and certificate authority files to the project directory.

6. Update the `config.json` file with the appropriate settings:

- `port`: The port number the server will listen on
- `ssl`: The paths to your SSL certificate, private key, and certificate authority files

```json
{
  "port": 8443,
  "ssl": {
    "key": "path/to/your/private-key.pem",
    "cert": "path/to/your/certificate.pem",
    "ca": "path/to/your/certificate-authority.pem"
  }
}
```

## Running the Application

Start the server:

```
node app.js
```

Visit the application in your browser at `https://localhost:<port>`, replacing `<port>` with the port number specified in your `config.json` file.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
```
