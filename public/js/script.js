(() => {
    async function onSubmit(event) {
        event.preventDefault();

        const loading = document.querySelector('#loading');
        loading.classList.remove('hidden');




        const resultsDiv = document.querySelector('#results');
        resultsDiv.innerHTML = '';

        const info = getParameters();

        //console.log(info.path);
        //console.log(info.options);

        const response = await fetch(info.path, info.options);
        const json = await response.json();
        console.log(json);
        //console.log(Object.keys(json[1]));
        //console.log(Object.values(Object.keys(json[1]))[1]);
        //console.log(Object.values(Object.values(Object.keys(json[1]))[1]));
        for (var prop in json) {
            //console.log(Object.keys(json[prop]));
            //console.log(Object.values(json[prop]));
            let rowInfo = Object.values(json[prop]);
            for (let i = 0; i < rowInfo.length; i++) {
                //console.log(rowInfo[i]);
            }
            //console.log(prop + " = " + json[prop] + "\n");
        }

        

        $('#datatable').DataTable({
            dom: 'lBfrtip',
            //"scrollX": true,
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print', 'colvis'
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
                //{ data: '課程地點地址' },
                //{ data: '課程主題' },
                //{ data: '課程類型' },

            ],

            //paging: false,
            //select: true,
            

            initComplete: function () {
                this.api().columns().every( function () {
                    var column = this;
                    var select = $('<select><option value=""></option></select>')
                        .appendTo( $(column.footer()).empty() )
                        .on( 'change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );
     
                            column
                                .search( val ? '^'+val+'$' : '', true, false )
                                .draw();
                        } );
     
                    column.data().unique().sort().each( function ( d, j ) {
                        select.append( '<option value="'+d+'">'+d+'</option>' )
                    } );
                } );
            },


        });

        $('input.global_filter').on( 'keyup click', function () {
            filterGlobal();
        } );
     
        $('input.column_filter').on( 'keyup click', function () {
            filterColumn( $(this).parents('tr').attr('data-column') );
        } );

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

    function filterGlobal () {
        $('#datatable').DataTable().search(
            $('#global_filter').val(),
            $('#global_regex').prop('checked'),
            $('#global_smart').prop('checked')
        ).draw();
    }
     
    function filterColumn ( i ) {
        $('#datatable').DataTable().column( i ).search(
            $('#col'+i+'_filter').val(),
            $('#col'+i+'_regex').prop('checked'),
            $('#col'+i+'_smart').prop('checked')
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

    async function onPostform(event){
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
            if (bodyObj[studentName.name] && bodyObj[studentID.name] && bodyObj[classDate.name]
                && bodyObj[signinTime.name] && bodyObj[signoutTime.name]
                && bodyObj[centerName.name] && bodyObj[courseName.name]) {
                options.body = JSON.stringify(bodyObj);
                options.headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                };

                const response = await fetch(path, options);
                const json = await response.json();
                console.log(json);

            }

            studentName.value='';
            studentID.value='';
            console.log(path);
            console.log(options);



    }

    async function changeFiltertable(event){
        event.preventDefault();

        const filterTable = document.querySelector('#filterTable');
        if(filterTable.classList.contains('hidden')){
            filterTable.classList.remove('hidden');
        }
        else{
            filterTable.classList.add('hidden');
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
        //console.log(info);

        const optionsPretty = JSON.stringify(info.options, null, 2);
        //console.log(optionsPretty);

        const previewArea = document.querySelector('#preview-area');
        previewArea.innerHTML = `fetch('${info.path}', ${optionsPretty});`
    }

    const pathInput = document.querySelector('#path-input');
    pathInput.addEventListener('keyup', createRequestPreview);
    const methodInput = document.querySelector('#method-input');
    methodInput.addEventListener('change', createRequestPreview);

    const addButton = document.querySelector('#add-button');
    addButton.addEventListener('click', (event) => {
        event.preventDefault();
        addKeyValueInput();
    });

    const postButton = document.querySelector('#form-value');
    postButton.addEventListener('submit', onPostform);



    const filterButton = document.querySelector('#filterButton');
    filterButton.addEventListener('click', changeFiltertable);

    const form = document.querySelector('.fetchForm');
    form.addEventListener('submit', onSubmit);
    createRequestPreview();

})();