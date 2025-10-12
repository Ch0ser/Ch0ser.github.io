(() => {
  // <stdin>
  (function() {
    const jsonURL = "{{ .Params.jsonURL }}";
    let searchData = null;
    async function loadSearchData() {
      if (searchData) return searchData;
      try {
        const res = await fetch(jsonURL);
        searchData = await res.json();
        return searchData;
      } catch (e) {
        console.error("\u641C\u7D22\u6570\u636E\u52A0\u8F7D\u5931\u8D25:", e);
        return [];
      }
    }
    function highlightKeyword(text, keyword) {
      if (!keyword) return text;
      const regex = new RegExp(`(${keyword})`, "gi");
      return text.replace(regex, "<mark>$1</mark>");
    }
    async function performSearch(keyword) {
      const resultsContainer = document.querySelector("[data-search-results]");
      if (!resultsContainer) return;
      if (!keyword || keyword.length < 2) {
        resultsContainer.innerHTML = "";
        return;
      }
      const data = await loadSearchData();
      const lowerKeyword = keyword.toLowerCase();
      const results = data.filter(
        (item) => item.title && item.title.toLowerCase().includes(lowerKeyword) || item.content && item.content.toLowerCase().includes(lowerKeyword)
      ).slice(0, 10);
      if (results.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">\u6CA1\u6709\u627E\u5230\u7ED3\u679C</p>';
        return;
      }
      const html = results.map((item) => {
        const title = highlightKeyword(item.title || "\u65E0\u6807\u9898", keyword);
        const excerpt = (item.content || "").substring(0, 120);
        const content = highlightKeyword(excerpt, keyword);
        return `
        <div class="search-result">
          <h3><a href="${item.permalink}">${title}</a></h3>
          <p>${content}...</p>
        </div>
      `;
      }).join("");
      resultsContainer.innerHTML = html;
    }
    document.addEventListener("DOMContentLoaded", () => {
      const input = document.querySelector('[data-search] input[name="keyword"]');
      if (!input) return;
      let timeout;
      input.addEventListener("input", (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          performSearch(e.target.value.trim());
        }, 300);
      });
      document.querySelector("[data-search]").addEventListener("submit", (e) => {
        e.preventDefault();
        performSearch(input.value.trim());
      });
    });
  })();
})();
