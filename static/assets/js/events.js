// Get all those js events going
window.addEventListener("load", () => {
    changeUpdateTime()
} )

function changeUpdateTime() {
    fetch( LAST_MOD_URL, {
        method: 'GET',
        cache: "no-cache",
    })
    .then( r => r.text()
        .then( t => {
            let date = new Date(t)
            let day = new Date( date.getFullYear(), date.getMonth(), date.getDate() )
            /** @type {HTMLTimeElement} */
            let timeElement = document.querySelector("#last-updated")
            timeElement.dateTime = `${day.getFullYear()}-${day.getMonth()+1}-${day.getDate()}`
            timeElement.innerText = `${day.getDate()}/${day.getMonth()+1}/${day.getFullYear()}`
        } )
    )
}

function copyToClipboard(button, blockcount) {
    const code = document.querySelector(`#codeblock-${blockcount}`)
    const copyContent = async () => {
        try {
            await navigator.clipboard.writeText( code.textContent )
        }
        catch (err) {}
    }
    copyContent()
}