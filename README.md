# CachyOS Repository Dashboard

<div align="center">
    <a href="example.png">
        <picture>
            <source media="(prefers-color-scheme: dark)" srcset="example-dark.png">
            <source media="(prefers-color-scheme: light)" srcset="example-light.png">
            <img alt="Screenshot of the dashboard" src="example-light.png" width="600px">
        </picture>
    </a>
</div>

The web dashboard for the CachyOS repositories provides a user-friendly interface to search and view packages.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [Bun](https://bun.sh/) (v1.2 or later)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/cachyos/public-dashboard.git
    cd public-dashboard
    ```

2.  Install the dependencies:

    ```bash
    bun --bun install
    ```

3.  Start the development server:
    ```bash
    bun --bun run dev
    ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Testing

This project uses [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for testing.

### Running Tests

To run all tests:

```bash
bun run test
```

### References

- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing/vitest)
- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Building for Production

To create a production-ready build, run the following command:

```bash
bun --bun run build
```

This will create an optimized build in the `.next` directory. To run the production server, use:

```bash
bun run start
```

## Building and Running with Docker

You can also build and run the web dashboard using Docker.

### Build the Docker Image

To build the Docker image, run the following command from the root directory:

```bash
docker build -t public-repo-dashboard .
```

### Run the Docker Container

To run the Docker container, use the following command:

```bash
docker run -p 3000:3000 public-repo-dashboard
```

The application will be available at [http://localhost:3000](http://localhost:3000).
