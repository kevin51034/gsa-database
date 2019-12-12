(() => {

    // get all data from sheet 4
    async function onSubmit(event) {
        event.preventDefault();

        const loading = document.querySelector('#loading');
        loading.classList.remove('hidden');

        const resultsDiv = document.querySelector('#results');
        resultsDiv.innerHTML = '';

        const response = await fetch('/api', {
            method: 'GET'
        });
        const json = await response.json();
        
        //const info = getParameters();
        //const response = await fetch(info.path, info.options);
        //const json = await response.json();

        $('#datatable').DataTable().destroy();
        //$('#datatable').DataTable().empty();

        $('#datatable').DataTable({
            dom: 'lBfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'print', 'colvis', //'pdf'
            ],
            
            data: json,
            columns: [{
                    data: '中心id'
                },
                {
                    data: '姓名'
                },
                {
                    data: '身分證字號'
                },
                {
                    data: '學員證字號'
                },
                {
                    data: '樂齡學習中心名稱'
                },
                {
                    data: '社區'
                },
                {
                    data: '課程id'
                },
                {
                    data: '課程名稱'
                },
                {
                    data: '課程日期mmddyyyy'
                },
                {
                    data: '簽到時間'
                },
                {
                    data: '簽退時間'
                },

            ],

            // select search
            initComplete: function () {
                this.api().columns().every(function () {
                    var column = this;
                    var select = $('<select><option value=""></option></select>')
                        .appendTo($(column.footer()).empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );
                            column
                                .search(val ? '^' + val + '$' : '', true, false)
                                .draw();
                        });
                    column.data().unique().sort().each(function (d, j) {
                        select.append('<option value="' + d + '">' + d + '</option>')
                    });
                });
            },


        });

        // text search
        $('input.global_filter').on('keyup click', function () {
            filterGlobal();
        });

        $('input.column_filter').on('keyup click', function () {
            filterColumn($(this).parents('tr').attr('data-column'));
        });

        resultsDiv.textContent = JSON.stringify(json, null, 2);
        //console.log(resultsDiv.textContent);

        const resultsContainer = document.querySelector('#results-container');
        resultsContainer.classList.remove('hidden');
        const datatable = document.querySelector('#datatable');
        datatable.classList.remove('hidden');

        const filterButtondiv = document.querySelector('#filterButtondiv');
        filterButtondiv.classList.remove('hidden');
        loading.classList.add('hidden');
    }

    /*setInterval( function () {
        $('#datatable').DataTable().reload( null, false ); // user paging is not reset on reload
        console.log('reload');
    }, 10000 );*/

    function filterGlobal() {
        $('#datatable').DataTable().search(
            $('#global_filter').val(),
            $('#global_regex').prop('checked'),
            $('#global_smart').prop('checked')
        ).draw();
    }


    function filterColumn(i) {
        $('#datatable').DataTable().column(i).search(
            $('#col' + i + '_filter').val(),
            $('#col' + i + '_regex').prop('checked'),
            $('#col' + i + '_smart').prop('checked')
        ).draw();
    }


    function addKeyValueInput() {
        const container = document.createElement('div');
        container.className = 'body-row';

        const key = document.createElement('input');
        key.type = 'text';
        key.className = 'key';
        key.placeholder = 'key';
        key.addEventListener('keyup', createRequestPreview);

        const value = document.createElement('input');
        value.type = 'text';
        value.className = 'value';
        value.placeholder = 'value';
        value.addEventListener('keyup', createRequestPreview);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            container.remove();
            createRequestPreview();
        });

        container.append(key);
        container.append(' : ');
        container.append(value);
        container.append(removeButton);
        const keysContainer = document.querySelector('#key-values');
        keysContainer.append(container);
    }

    async function onPostform(event) {
        event.preventDefault();
        const path = '/api';

        const options = {
            method: 'POST'
        };

        //POST
        //const formDataContainer = document.querySelector('#form-values');
        //const allRows = bodyDataContainer.querySelectorAll('.body-row');
        const bodyObj = {};

        const studentName = document.querySelector('.studentName')
        const studentID = document.querySelector('.studentID')
        const classDate = document.querySelector('.classDate')
        const signinTime = document.querySelector('.signinTime')
        const signoutTime = document.querySelector('.signoutTime')

        const centerName = document.querySelector('.centerName')
        const courseName = document.querySelector('.courseName')

        bodyObj[studentName.name] = studentName.value.trim();
        bodyObj[studentID.name] = studentID.value.trim();
        bodyObj[classDate.name] = classDate.value.trim();
        bodyObj[signinTime.name] = signinTime.value.trim();
        bodyObj[signoutTime.name] = signoutTime.value.trim();
        bodyObj[centerName.name] = centerName.options[centerName.selectedIndex].value;
        bodyObj[courseName.name] = courseName.options[courseName.selectedIndex].value;

        console.log(bodyObj);
        //input 3~10 10 is note
        //console.log(document.getElementsByTagName("input")[3].value);

        // transfer object to JSON and post

        const bodySize = Object.keys(bodyObj).length;
        if (bodyObj[studentName.name] && bodyObj[studentID.name] && bodyObj[classDate.name] &&
            bodyObj[signinTime.name] && bodyObj[signoutTime.name] &&
            bodyObj[centerName.name] && bodyObj[courseName.name]) {
            options.body = JSON.stringify(bodyObj);
            options.headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };

            const response = await fetch(path, options);
            const json = await response.json();
            console.log(json);

        }

        studentName.value = '';
        studentID.value = '';
        //console.log(path);
        console.log(options);



    }

    async function changeFiltertable(event) {
        event.preventDefault();

        const filterTable = document.querySelector('#filterTable');
        if (filterTable.classList.contains('hidden')) {
            filterTable.classList.remove('hidden');
        } else {
            filterTable.classList.add('hidden');
        }
    }

    // show the info list dynamically from sheet 5
    async function appendSelectOption() {
        console.log('append');
        const response = await fetch('/api/5', {
            method: 'GET'
        });
        const json = await response.json();
        console.log(json);

        for (var prop in json) {
            //console.log(Object.keys(json[prop]));
            //console.log(Object.values(json[prop]));
            let rowKey = Object.keys(json[prop]);
            let rowValue = Object.values(json[prop]);
            for (let i = 0; i < rowKey.length; i++) {

                //console.log('key = ' + rowKey[i]);
                //console.log('value = ' + rowValue[i]);

                if (rowKey[i] == '課程名稱' && rowValue[i]) {
                    console.log('key = ' + rowKey[i]);
                    console.log('value = ' + rowValue[i]);
                    let option = document.createElement('option');
                    option.text = rowValue[i];
                    option.value = rowValue[i];
                    let select = document.querySelector('.courseName');
                    console.log(select);
                    console.log(option);

                    select.appendChild(option);
                }
                /*else if (rowKey[i] == '樂齡學習中心名稱' && rowValue[i]) {
                    console.log('key = ' + rowKey[i]);
                    console.log('value = ' + rowValue[i]);
                    let option = document.createElement('option');
                    option.text = rowValue[i];
                    option.value = rowValue[i];
                    let select = document.querySelector('.centerName');
                    console.log(select);
                    console.log(option);

                    select.appendChild(option);
                }*/
            }
        }
    }

    function getParameters() {
        const path = pathInput.value.trim();

        const index = methodInput.selectedIndex;
        const method = methodInput.options[index].value;
        const options = {
            method: method
        };

        const bodyDataContainer = document.querySelector('#key-values');
        const allRows = bodyDataContainer.querySelectorAll('.body-row');
        const bodyObj = {};
        for (let i = 0; i < allRows.length; i++) {
            const row = allRows[i];
            const keyInput = row.querySelector('.key').value.trim();
            const valueInput = row.querySelector('.value').value.trim();
            if (keyInput && valueInput) {
                bodyObj[keyInput] = valueInput;
            }
        }
        const bodySize = Object.keys(bodyObj).length;
        if (bodySize > 0) {
            options.body = JSON.stringify(bodyObj);
            options.headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            };
        }
        return {
            path,
            options
        };
    }

    function createRequestPreview() {
        const info = getParameters();
        const optionsPretty = JSON.stringify(info.options, null, 2);
        const previewArea = document.querySelector('#preview-area');
        previewArea.innerHTML = `fetch('${info.path}', ${optionsPretty});`
    }

    //const pathInput = document.querySelector('#path-input');
    //pathInput.addEventListener('keyup', createRequestPreview);
    //const methodInput = document.querySelector('#method-input');
    //methodInput.addEventListener('change', createRequestPreview);

    /*const addButton = document.querySelector('#add-button');
    addButton.addEventListener('click', (event) => {
        event.preventDefault();
        addKeyValueInput();
    });*/

    const postButton = document.querySelector('#form-value');
    postButton.addEventListener('submit', onPostform);



    const filterButton = document.querySelector('#filterButton');
    filterButton.addEventListener('click', changeFiltertable);

    const form = document.querySelector('.fetchForm');
    form.addEventListener('submit', onSubmit);

    window.addEventListener('load', function () {
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.getElementsByClassName('needs-validation');
        // Loop over them and prevent submission
        var validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                form.classList.add('was-validated');
            }, false);
        });
    }, false);

    appendSelectOption();
    //createRequestPreview();

})();