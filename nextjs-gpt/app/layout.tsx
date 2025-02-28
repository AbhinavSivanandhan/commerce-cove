import "./global.css"

export const metadata = {
    title: "GPTProject",
    description: "Custom GPT Bot"
}

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    )
}

export default RootLayout;