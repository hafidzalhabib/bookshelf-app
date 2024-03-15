// inisialisasi
const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";
// const Swal = require("sweetalert2");

// ubah keterangan tombol jika selesai dibaca dicentang
const checkComplete = document.getElementById("inputBookIsComplete");
checkComplete.addEventListener("change", function () {
  const submit = document.getElementById("bookSubmit");
  if (checkComplete.checked) {
    submit.innerHTML = "Masukkan Buku ke rak <span>selesai dibaca</span>";
  } else {
    submit.innerHTML = "Masukkan Buku ke rak <span> Belum selesai dibaca</span>";
  }
});

// membuka popup ketika tombol tambah buku ditekan
const pop = document.getElementById("btn-add");
pop.addEventListener("click", function (event) {
  document.querySelector("#popup-input").classList.add("active");
  document.querySelector(".main").classList.add("active");
});

// tutup popup tambah buku
document.querySelector("#close-input").addEventListener("click", function () {
  document.querySelector("#popup-input").classList.remove("active");
  document.querySelector(".main").classList.remove("active");
});

// fungsi generate ID buku
function generateId() {
  return +new Date();
}

// fungsi membuat kumpulan data buku
function generateBookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
  };
}

// fungsi load data dari local storage
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

// event input data ke array
document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    submitForm.reset();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// fungsi mengecek dukungan browser terhadap local storage
function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

// fungsi save array ke local storage
function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

// fungsi menambahkan data buku baru ke array
function addBook() {
  const BookTitle = document.getElementById("inputBookTitle").value;
  const BookAuthor = document.getElementById("inputBookAuthor").value;
  const Year = document.getElementById("inputBookYear").value;
  const BookYear = parseInt(Year);
  const BookIsComplete = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, BookTitle, BookAuthor, BookYear, BookIsComplete);

  const ada = books.some((item) => item.title === bookObject.title && item.author === bookObject.author && item.year === bookObject.year);
  if (ada) {
    // alert("Buku sudah ada");
    Swal.fire({
      icon: "error",
      title: "Ops...",
      text: "Buku sudah ada dalam list",
      showConfirmButton: false,
      timer: 1500,
    });
  } else {
    books.push(bookObject);
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: "Buku telah disimpan",
      showConfirmButton: false,
      timer: 1500,
    });
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

// fungsi untuk mencari buku dalam array
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

// fungsi menemukan id buku
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

// fungsi menghapus daftar buku
function removeBookFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  Swal.fire({
    title: "Yakin ingin hapus buku ini?",
    showCancelButton: true,
    confirmButtonText: "Hapus",
    cancelButtonText: `Batal`,
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "",
        showConfirmButton: false,
        timer: 1500,
      });
      books.splice(bookTarget, 1);
      saveData();
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  });
}

// fungsi menambahkan buku kedalam rak selesai dibaca
function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "Buku dipindah ke rak selesai dibaca",
    showConfirmButton: false,
    timer: 1500,
  });
}

// fungsi menambahkan buku kedalam rak belum selesai dibaca
function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  Swal.fire({
    icon: "success",
    title: "Berhasil",
    text: "Buku dipindah ke rak belum dibaca",
    showConfirmButton: false,
    timer: 1500,
  });
}

// fungsi untuk mengedit detail buku
function editBook(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  const titleEdited = document.getElementById("editTitle");
  const authorEdited = document.getElementById("editAuthor");
  const yearEdited = document.getElementById("editYear");

  titleEdited.setAttribute("value", bookTarget.title);
  authorEdited.setAttribute("value", bookTarget.author);
  yearEdited.setAttribute("value", bookTarget.year);

  document.getElementById("inputEdit").addEventListener("submit", function () {
    bookTarget.title = titleEdited.value;
    bookTarget.author = authorEdited.value;
    bookTarget.year = yearEdited.value;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  });
}

// event close edit data buku
document.querySelector("#close-edit").addEventListener("click", function () {
  document.querySelector("#popup-edit").classList.remove("active");
  document.querySelector(".main").classList.remove("active");
});

// fungsi untuk membuat list yang akan ditambahkan ke array buku
function makeList(bookObject) {
  const textTitle = document.createElement("h4");
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = bookObject.author;

  const textYear = document.createElement("p");
  textYear.innerText = bookObject.year;

  const textArticle = document.createElement("article");
  textArticle.classList.add("book_item");
  textArticle.append(textTitle, textAuthor, textYear);

  if (bookObject.isCompleted) {
    const belumButton = document.createElement("button");
    belumButton.classList.add("green");
    belumButton.innerText = "Belum selesai di Baca";
    belumButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const hapusButton = document.createElement("button");
    hapusButton.classList.add("red");
    hapusButton.innerText = "Hapus buku";
    hapusButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit Buku";

    editButton.addEventListener("click", function () {
      document.querySelector("#popup-edit").classList.add("active");
      document.querySelector(".main").classList.add("active");
      editBook(bookObject.id);
    });

    textArticle.append(belumButton, hapusButton, editButton);
  } else {
    const sudahButton = document.createElement("button");
    sudahButton.classList.add("green");
    sudahButton.innerText = "Selesai dibaca";
    sudahButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });

    const hapusButton = document.createElement("button");
    hapusButton.classList.add("red");
    hapusButton.innerText = "Hapus buku";
    hapusButton.addEventListener("click", function () {
      removeBookFromCompleted(bookObject.id);
    });

    const editButton = document.createElement("button");
    editButton.classList.add("blue");
    editButton.innerText = "Edit Buku";

    editButton.addEventListener("click", function () {
      document.querySelector("#popup-edit").classList.add("active");
      document.querySelector(".main").classList.add("active");
      editBook(bookObject.id);
    });

    textArticle.append(sudahButton, hapusButton, editButton);
  }
  return textArticle;
}

// event untuk memasukkan buku kedalam rak selesai atau belum selesai dibaca
document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
  incompleteBookshelfList.innerHTML = "";

  const completeBookshelfList = document.getElementById("completeBookshelfList");
  completeBookshelfList.innerHTML = "";

  let selesai = 0;
  let belum = 0;

  for (const bookItem of books) {
    const bookElement = makeList(bookItem);
    if (!bookItem.isCompleted) {
      incompleteBookshelfList.append(bookElement);
      belum++;
    } else {
      completeBookshelfList.append(bookElement);
      selesai++;
    }
  }

  // menampilkan jumlah buku
  const jumlah = books.length;
  document.getElementById("jumlah").innerText = jumlah;
  document.getElementById("selesai").innerText = selesai;
  document.getElementById("belum").innerText = belum;
});

// fungsi untuk search buku
const searchBook = document.querySelector("#searchBookTitle");
searchBook.addEventListener("keyup", searchbook);
function searchbook(event) {
  const searchBook = event.target.value.toLowerCase();
  let itemBook = document.querySelectorAll(".book_item");

  itemBook.forEach((item) => {
    const book = item.children[0].innerText.toLowerCase();
    if (book.indexOf(searchBook) != -1) {
      item.setAttribute("style", "display: block");
    } else {
      item.setAttribute("style", "display: none !important;");
    }
  });
}

// fungsi untuk load data dari local storage
document.addEventListener(SAVED_EVENT, function () {
  localStorage.getItem(STORAGE_KEY);
});
